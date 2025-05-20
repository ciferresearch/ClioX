if [ -z "${TEST}" ]; then
  if [ -z "${DEV}" ]; then
    python3
  else
    python3 -u src/main.py
  fi
else
  pytest -v
fi