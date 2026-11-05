# PyTorch (CPU wheel) on top of the default environment's packages. Build context: code-envs/.
FROM python:3.12.15-slim-trixie
COPY default/requirements.txt /tmp/default.txt
COPY torch/requirements.txt /tmp/torch.txt
RUN pip install --no-cache-dir -r /tmp/default.txt && pip install --no-cache-dir -r /tmp/torch.txt
