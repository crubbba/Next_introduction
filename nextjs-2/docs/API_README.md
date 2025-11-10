# API Endpoints  


## Endpoints  

| Recurso        | Método | Endpoint               | Descripción                          |
|----------------|--------|------------------------|--------------------------------------|
| **Users**      | POST   | `/users/`  | Registra un nuevo usuario.          |
|       | GET   | `/users/`  | Lista usuarios.          |
|       | GET   | `/users/{id}`  | Obtiene los detalles de un usuario.          |
|                | POST   | `/login`     | Inicia sesión y obtiene un token.   |
| **Events**     | GET    | `/events`          | Obtiene la lista de eventos.        |
|                | POST   | `/events`          | Crea un nuevo evento.               |
|                | GET    | `/events/{id}`     | Obtiene los detalles de un evento.  |
| **Registrations** | POST | `/registrations`   | Registra a un usuario en un evento. |
|                | GET    | `/registrations`   | Lista las inscripciones del usuario.|

**Nota:** Todos los endpoints excepto (`/login`) requieren autenticación mediante un token.
`/registrations?userId=U002`   puede traer las inscripciones del usuario con el userId=002

## Estructura de Entidades (Ejemplo)

<pre>  
users: {
    "userId": "U001",
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "city": "Bogotá",
    "password": "Hola1234**"
  }

registrations:   {
    "regId": "R001",
    "eventId": "E001",
    "userId": "U002",
    "registeredAt": "2025-10-10T09:15:00Z"
  },

  {
    "eventId": "E001",
    "name": "Encuentro de Inteligencia Artificial",
    "description": "Conversatorio sobre el uso de la IA en empresas colombianas.",
    "date": "2025-12-05T18:00:00Z",
    "city": "Bogotá",
    "createdBy": "U001"
  }
</pre>