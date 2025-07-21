# Backend 

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About the project</a>
    </li>
    <li>
      <a href="#setup">How to setup project</a>
    </li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## [About The Project](#about-the-project)
This is simple REST APIs Service

<!-- GETTING STARTED -->
## [How to setup project](#setup)

1. Install docker, docker compose
   
2. Replace .env.example to .env
      ```sh
   mv .env.example  .env
   ```
4. Run docker compose
      ```sh
   cd project && docker compose up -d
   ```

5. Install packages
      ```sh
   yarn
   ```

6. run migration database
      ```sh
   yarn migration
   ```
7. run app
      ```sh
   yarn start
   ```      