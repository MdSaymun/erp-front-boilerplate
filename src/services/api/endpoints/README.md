# API endpoint groups

One file per backend module. Each file exports the module's base path and, once
the backend exists, typed functions built on `http` from `../client`.

Rules:

- Do not call `axios` directly; use `http`/`apiClient`.
- Return plain data (`Promise<T>`), never Axios responses.
- Do not put tenant or company ids in URLs or bodies; the backend resolves them
  from the authenticated session.
- Business endpoints are added in the phase that implements the module.
