# Algorithm implementation based on the OceanProtocol ecosystem

Copy the full `python` directory and implement the algorithm in the `src/implementation/` subdirectory, if needed import other files using relative routes.

This template is using `uv` as python's package manager, although the Dockerfile we provide needs a `requirements.txt`, so we need to generate it in some way, in the default case, using `uv` we could run:

```bash
$ uv pip compile pyproject.toml -o requirements.txt
```

_Algorithm details_