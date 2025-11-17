# Jenkins setup for this repository

This project includes a Jenkins setup to run CI builds using Docker.

Quick steps to run Jenkins locally with the project:

1. Start the services (database, web and Jenkins):

```powershell
docker-compose up -d db web jenkins
```

2. Retrieve the initial admin password (first-time setup):

```powershell
docker exec appvestidos-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

3. Open Jenkins in your browser at `http://localhost:8080` and complete the setup.

4. Create a new Pipeline job and point it to this repository (Multibranch or Pipeline using `Jenkinsfile`).

About the `Jenkinsfile`:

- Located at project root as `Jenkinsfile`.
- It runs `npm ci` and `npm run build`. Lint is optional and will not cause the build to fail if missing.

Notes & security:

- The Jenkins container is configured to bind the Docker socket (`/var/run/docker.sock`) so builds can run Docker commands. Be aware this gives the Jenkins container elevated access to the Docker daemon on the host.
- You may prefer to run Jenkins separately (not using the project's compose file) for production or shared CI.

Alternativa: configurar la herramienta NodeJS en Jenkins
----------------------------------------------------

Si prefieres no usar `docker run` dentro del pipeline, puedes configurar Node.js como "Global Tool" en Jenkins:

- Instala el plugin **NodeJS** desde "Manage Jenkins" → "Manage Plugins".
- Ve a "Manage Jenkins" → "Global Tool Configuration" → "NodeJS installations".
- Añade una instalación, dale el nombre `node18` (o cambia el nombre en el `Jenkinsfile`).
- En ese caso, en el `Jenkinsfile` puedes usar `tools { nodejs "node18" }` y ejecutar `npm` directamente.

Nota: Usar la configuración global requiere que Jenkins pueda descargar o disponer del binario Node (internet o binarios preinstalados en el servidor).

