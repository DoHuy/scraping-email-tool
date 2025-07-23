import React, { Fragment, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
  OverlayTrigger,
  Tooltip,
  InputGroup,
} from "react-bootstrap";
import FullPageSpinner from "./FulllPageSpinner";
import RichTextEditor from "./RichTextEditor";
import {
  getAccessToken,
  msalInstance,
  SCOPES,
} from "../services/client/msaConfig";

const ScrapeEmailForm: React.FC = () => {
  // States
  const [inputText, setInputText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const [emails, setEmails] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");
  const [customEmailError, setCustomEmailError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");

  const [editorState, setEditorState] = useState("");

  const [files, setFiles] = useState<FileList | null>(null);

  //loading  state for Scrape
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // URL validation: line must be valid http(s) url
  const isValidURL = (url: string) => {
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Validate all URLs from multi-line input
  const validateInputText = (): boolean => {
    const lines = inputText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const invalidLines = lines.filter((line) => !isValidURL(line));

    if (invalidLines.length > 0) {
      setInputError(`Invalid URL(s):\n${invalidLines.join("\n")}`);
      return false;
    }

    setInputError(null);
    return true;
  };

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle scrape API call
  const handleScrape = async () => {
    if (!validateInputText()) return;

    if (inputText === "") {
      alert("Please add at least one url.");
      return;
    }
    setScrapeLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/scrape`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            links: inputText.split(",").map((line) => line.trim()),
          }),
        }
      );
      const { data: emails, message } = await response.json();
      if (Array.isArray(emails)) {
        setEmails((prev) => [...new Set([...prev, ...emails])]);
      }
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setScrapeLoading(false);
    }
  };

  // Add custom email after validating it
  const handleAddCustomEmail = () => {
    const emailTrimmed = customEmail.trim();
    if (!emailTrimmed) {
      setCustomEmailError("Email cannot be empty");
      return;
    }
    if (!isValidEmail(emailTrimmed)) {
      setCustomEmailError("Invalid email format");
      return;
    }
    if (emails.includes(emailTrimmed)) {
      setCustomEmailError("Email already added");
      return;
    }
    setEmails((prev) => [...prev, emailTrimmed]);
    setCustomEmail("");
    setCustomEmailError(null);
  };

  // Remove email badge
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  // Submit handler
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (emails.length === 0) {
      alert("Please add at least one email.");
      return;
    }
    setSubmitLoading(true);

    let accessToken = "";
    try {
      console.log("Please login to Azure first.");
      await msalInstance.initialize();
      // need to login to Azure first
      const signedInAzure = await getAccessToken();
      if (!signedInAzure) {
        const loginResponse = await msalInstance.loginPopup({ scopes: SCOPES });

        const account = loginResponse.account;
        msalInstance.setActiveAccount(account);

        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: SCOPES,
          account,
        });
        accessToken = tokenResponse.accessToken;
      } else {
        accessToken = signedInAzure;
      }

      // Prepare form data
      const formData = new FormData();
      emails.forEach((email, i) => formData.append(`emails[${i}]`, email));
      formData.append("subject", subject);
      formData.append("body", `${editorState}`);
      formData.append("accessToken", accessToken);
      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sendEmails`,
        {
          method: "POST",
          body: formData,
        }
      );
      const blob = await response.blob();
      // Download the xlsx file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // You can set a default file name or get it from response headers if available
      a.download = "emails_status.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Reset form or keep data as needed
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to submit form.");
    } finally {
      setSubmitLoading(false);
      // Reset form fields
      setInputText("");
      setEmails([]);
      setCustomEmail("");
      setSubject("");
      setEditorState("");
      setFiles(null);
      setInputError(null);
      setCustomEmailError(null);
    }
  };

  return (
    <Fragment>
      {/* Full page spinner when loading */}
      <FullPageSpinner show={scrapeLoading || submitLoading} />
      <Container className="my-4">
        {/* Application Icon */}
        <Row className="justify-content-center mb-3">
          <Col xs="auto" className="text-center">
            <i
              className="bi bi-envelope-fill"
              style={{ fontSize: "6rem", color: "#0d6efd" }}
            ></i>
          </Col>
        </Row>

        <Form encType="multipart/form-data">
          {/* Multi-line URL input */}
          <Form.Group controlId="textInput" className="mb-3">
            <Form.Label>Scraped Website URLs (one link per comma)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter Scraped Website URLs"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              isInvalid={!!inputError}
            />
            <Form.Control.Feedback type="invalid">
              {inputError}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Scrape Button */}
          <Button
            variant="info"
            onClick={handleScrape}
            className="mb-3"
            disabled={scrapeLoading}
          >
            {scrapeLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Scraping...
              </>
            ) : (
              "Scrape"
            )}
          </Button>

          {/* Emails badges with tooltip */}
          <Form.Group controlId="emailList" className="mb-3">
            <Form.Label>Scraped / Custom Emails</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {emails.map((email, index) => (
                <OverlayTrigger
                  key={index}
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-${index}`}>Click to remove</Tooltip>
                  }
                >
                  <Badge
                    bg="secondary"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRemoveEmail(email)}
                  >
                    {email} ✖
                  </Badge>
                </OverlayTrigger>
              ))}
            </div>
          </Form.Group>

          {/* Add custom email */}
          <InputGroup className="mb-3">
            <Form.Control
              type="email"
              placeholder="Add custom email"
              value={customEmail}
              onChange={(e) => {
                setCustomEmail(e.target.value);
                setCustomEmailError(null);
              }}
              isInvalid={!!customEmailError}
            />
            <Button variant="outline-primary" onClick={handleAddCustomEmail}>
              Add Email
            </Button>
            <Form.Control.Feedback type="invalid">
              {customEmailError}
            </Form.Control.Feedback>
          </InputGroup>

          {/* Subject input */}
          <Form.Group controlId="emailSubject" className="mb-3">
            <Form.Label>Email Subject</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Form.Group>
          {/* Body textarea */}
          <Form.Group controlId="emailBody" className="mb-3">
            <Form.Label>Email Body</Form.Label>
            <RichTextEditor
              handleOnchange={(content) => {
                setEditorState(content);
              }}
            />
          </Form.Group>
          {/* Multiple file upload */}
          <Form.Group controlId="fileUpload" className="mb-3">
            <Form.Label>Upload Files</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileChange} />
          </Form.Group>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={submitLoading}
          >
            {submitLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </Form>
      </Container>
    </Fragment>
  );
};

export default ScrapeEmailForm;
