# Estrutura do Projeto — API de Cursos

## Tabelas

```text
user(
    id,
    name,
    email,
    password
)

teacher(
    id,
    name
)

course(
    id,
    teacher_id,
    title,
    description,
    youtube_id_playlist
)

lesson(
    id,
    course_id,
    title,
    youtube_id_video,
    position
)

course_watchlist(
    user_id,
    course_id,
    created_at
)

lesson_completion(
    user_id,
    lesson_id,
    completed_at
)
```

### Regras das tabelas

- `user.email` deve ser único.
- `course.teacher_id` referencia `teacher.id`.
- `lesson.course_id` referencia `course.id`.
- `lesson.position` define a ordem da aula dentro do curso.
- A combinação `(course_id, position)` deve ser única.
- A combinação `(user_id, course_id)` em `course_watchlist` deve ser única.
- A combinação `(user_id, lesson_id)` em `lesson_completion` deve ser única.
- `course_watchlist.created_at` registra quando o usuário salvou o curso.
- `lesson_completion.completed_at` registra quando o usuário concluiu a aula.

---

# Rotas da API

## Auth

### POST `/register`

Cria um usuário utilizando:

```text
name
email
password
```

Retorna o token de autenticação.

**Status:**

```text
201 Created
```

---

### POST `/login`

Valida `email` e `password`.

Se as credenciais forem válidas, retorna o token de autenticação.

**Status:**

```text
200 OK
401 Unauthorized → credenciais inválidas
```

---

### POST `/logout`

Revoga o token utilizado na requisição.

**Status:**

```text
204 No Content
```

---

# Usuário autenticado

### GET `/me`

Retorna os dados do usuário autenticado.

O usuário é identificado através do token da requisição.

**Status:**

```text
200 OK
401 Unauthorized
```

---

### GET `/me/watchlist`

Lista os cursos salvos pelo usuário autenticado.

Cada curso deve retornar também o progresso do usuário, por exemplo:

```json
{
    "id": 1,
    "title": "Curso de PHP",
    "teacher": "João Silva",
    "completed_lessons": 4,
    "total_lessons": 10,
    "percentage": 40
}
```

**Status:**

```text
200 OK
401 Unauthorized
```

---

# Cursos

### GET `/courses`

Lista os cursos disponíveis.

Cada curso retorna pelo menos:

```text
id
title
teacher
```

A rota deve possuir paginação.

Exemplo:

```text
GET /courses?page=1
```

**Status:**

```text
200 OK
```

---

### GET `/courses/{id}`

Retorna os dados de um curso.

Deve retornar:

```text
id
title
description
youtube_id_playlist
teacher
total_lessons
saved
```

`saved` informa se o usuário autenticado adicionou o curso à sua watchlist.

**Status:**

```text
200 OK
404 Not Found → curso inexistente
```

---

### GET `/courses/{id}/lessons`

Lista as aulas do curso em ordem de `position`.

Cada aula retorna:

```text
id
title
youtube_id_video
position
completed
```

`completed` informa se a aula já foi concluída pelo usuário autenticado.

**Status:**

```text
200 OK
404 Not Found → curso inexistente
```

---

### GET `/courses/{id}/progress`

Retorna o progresso do usuário autenticado naquele curso.

Exemplo:

```json
{
    "completed_lessons": 4,
    "total_lessons": 10,
    "percentage": 40
}
```

O progresso é calculado com base nas aulas existentes no curso e nos registros de `lesson_completion` do usuário.

**Status:**

```text
200 OK
404 Not Found → curso inexistente
```

---

### POST `/courses/{id}/watchlist`

Adiciona o curso à watchlist do usuário autenticado.

O `user_id` não deve ser enviado pelo cliente. Ele deve ser obtido através do token de autenticação.

Repetir a requisição não gera erro e não cria registros duplicados.

**Status:**

```text
204 No Content
404 Not Found → curso inexistente
```

---

### DELETE `/courses/{id}/watchlist`

Remove o curso da watchlist do usuário autenticado.

Se o curso não estiver salvo, retorna `204` normalmente.

Remover um curso da watchlist não remove as aulas já concluídas pelo usuário.

**Status:**

```text
204 No Content
404 Not Found → curso inexistente
```

---

# Aulas

### GET `/lessons/{id}`

Retorna os dados de uma aula.

Deve retornar:

```text
id
title
youtube_id_video
position
course
completed
```

`completed` informa se a aula foi concluída pelo usuário autenticado.

**Status:**

```text
200 OK
404 Not Found → aula inexistente
```

---

### POST `/lessons/{id}/complete`

Marca a aula como concluída pelo usuário autenticado.

Cria um registro em:

```text
lesson_completion
```

com:

```text
user_id
lesson_id
completed_at
```

O `user_id` deve ser obtido através do token da requisição e nunca enviado pelo cliente.

Repetir a requisição não gera erro e não cria registros duplicados.

**Status:**

```text
204 No Content
404 Not Found → aula inexistente
```

---

### DELETE `/lessons/{id}/complete`

Remove a conclusão da aula para o usuário autenticado.

Se a aula não estiver marcada como concluída, retorna `204` normalmente.

**Status:**

```text
204 No Content
404 Not Found → aula inexistente
```

---

# Regras de autenticação e segurança

Todas as rotas que dependem do usuário devem identificar o usuário exclusivamente através do token de autenticação.

O cliente não deve enviar `user_id` para operações como:

```text
POST /courses/{id}/watchlist
DELETE /courses/{id}/watchlist

POST /lessons/{id}/complete
DELETE /lessons/{id}/complete

GET /courses/{id}/progress
GET /me
GET /me/watchlist
```

Por exemplo, o cliente envia apenas:

```text
POST /courses/15/watchlist
```

E o servidor determina:

```text
token
 ↓
usuário autenticado
 ↓
user_id
 ↓
adiciona course_id = 15 à watchlist desse usuário
```

Dessa forma, um usuário não consegue simplesmente alterar um `user_id` enviado na requisição para modificar os dados de outro usuário.
