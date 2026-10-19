import os
import sys

# Ensure backend directory is always in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# If running with a python environment that lacks dependencies, automatically re-exec with .venv
venv_python = os.path.join(backend_dir, ".venv", "bin", "python")
if os.path.exists(venv_python) and sys.executable != venv_python:
    try:
        import flask_cors  # test if packages available in current interpreter
    except ImportError:
        os.execv(venv_python, [venv_python] + sys.argv)

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
