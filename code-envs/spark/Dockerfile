# The official Spark image (PySpark through spark-submit), plus pyarrow for Parquet metadata.
# Build context: code-envs/.
FROM spark:4.0.4-scala2.13-java17-python3-ubuntu
USER root
RUN pip3 install --no-cache-dir pyarrow==21.0.0
USER spark
