# Práctica CI/CD con Jenkins — jenkins-demo-app

Pipeline de integración continua con Jenkinsfile (Pipeline as Code): compile, prueba y empaqueta una app Node.js, con parámetros, Multibranch Pipeline y webhook de GitHub.

## Estructura del proyecto

```
jenkins-demo-app/
├── index.js              # Función suma
├── package.json          # Scripts test y build
├── test/
│   └── suma.test.js      # Pruebas con assert
├── Jenkinsfile           # Pipeline declarativo
└── README.md
```

## Prueba local (sin Jenkins)

```bash
npm test
npm run build
```

## Paso 1 — Levantar Jenkins con Docker

```bash
docker volume create jenkins_home

docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17
```

Obtén la contraseña inicial:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

1. Abre http://localhost:8080
2. Pega la contraseña
3. Selecciona **Install suggested plugins**
4. Crea tu usuario administrador

## Paso 2 — Plugins adicionales

Ve a **Manage Jenkins → Plugins → Available plugins** e instala:

- Pipeline (suele venir con los sugeridos)
- Git y GitHub Integration
- Blue Ocean (opcional)
- Credentials Binding
- Email Extension (para el reto del Paso 8)

Reinicia Jenkins si lo solicita.

## Paso 3 — Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Proyecto base para práctica de Jenkins"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/jenkins-demo-app.git
git push -u origin main
```

## Paso 4 — Jenkinsfile

El `Jenkinsfile` ya incluye:

| Elemento | Descripción |
|----------|-------------|
| Parámetros | `ENTORNO` (staging/produccion), `EJECUTAR_DEPLOY` |
| Stages | Checkout → Instalar → Test → Build → Deploy (condicional) |
| Artefactos | Archiva `dist/**` |
| Post | Mensajes success / failure / always |

## Paso 5 — Job Multibranch Pipeline

1. Dashboard → **New Item**
2. Nombre: `jenkins-demo-app`, tipo: **Multibranch Pipeline**
3. **Branch Sources** → Git → URL del repositorio
4. Si es privado: **Manage Jenkins → Credentials** (Username + password o GitHub token)
5. Guarda: Jenkins escaneará y lanzará el primer build

**Nota:** El agente Jenkins (contenedor) necesita Node.js para ejecutar `npm`. En el agente built-in puedes instalarlo o usar un agente Docker. Opción rápida en el contenedor:

```bash
docker exec -u root jenkins bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"
```

## Paso 6 — Build manual con parámetros

1. Entra al job → rama `main`
2. **Build with Parameters**
3. Elige entorno y si ejecutar deploy
4. Revisa Stage View / Blue Ocean / Console Output

## Paso 7 — Webhook de GitHub

1. Repo → **Settings → Webhooks → Add webhook**
2. URL: `http://TU_IP_O_DOMINIO:8080/github-webhook/`
3. Content type: `application/json`
4. Evento: **Just the push event**
5. En Jenkins, en el job: marcar **GitHub hook trigger for GITScm polling**

Si Jenkins es local, usa [ngrok](https://ngrok.com/):

```bash
ngrok http 8080
```

Usa la URL HTTPS de ngrok en el webhook.

## Paso 8 — Reto: notificación por correo

1. Instala plugin **Email Extension**
2. Configura SMTP en **Manage Jenkins → System → Extended E-mail Notification**
3. En el `Jenkinsfile`, descomenta el bloque `mail` en `post { failure { ... } }`

## Checklist

- [ ] Jenkins en http://localhost:8080
- [ ] Plugins Git y Pipeline instalados
- [ ] Repo en GitHub con Jenkinsfile
- [ ] Multibranch Pipeline sin errores
- [ ] Etapas Checkout, Test, Build en verde
- [ ] Parámetros ENTORNO y EJECUTAR_DEPLOY funcionando
- [ ] Webhook probado con un push
- [ ] (Reto) Notificación por correo

## Comandos útiles de Docker

```bash
# Ver logs
docker logs -f jenkins

# Detener / iniciar
docker stop jenkins
docker start jenkins

# Eliminar (conserva datos en el volumen jenkins_home)
docker rm -f jenkins
```
