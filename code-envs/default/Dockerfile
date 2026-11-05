# The default environment: Python 3.12, NumPy and SymPy. Build context: code-envs/.
FROM python:3.12.15-slim-trixie
COPY default/requirements.txt /tmp/default.txt
RUN pip install --no-cache-dir -r /tmp/default.txt
