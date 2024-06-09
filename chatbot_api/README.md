1. Create vitual env

```bash
python3 -m venv .venv
```

2. Activate environment

```bash
source .venv/bin/activate
```

3. Download dependency

```bash
pip3 install -r requirements.txt
```

4. Run application

```bash
uvicorn main:app --reload
```
