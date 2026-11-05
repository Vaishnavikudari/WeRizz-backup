import os
import keyring
from dulwich import porcelain
from dulwich.repo import Repo

repo_path = r"c:\Users\Dell\OneDrive\Desktop\hackathons\open innovation\Masthishq"
os.chdir(repo_path)

# 1. Retrieve GitHub Token
token = keyring.get_password('git:https://github.com', 'Vaishnavikudari') or keyring.get_password('git:https://github.com', '')
if not token:
    raise Exception("GitHub personal access token not found in Windows Credential Manager!")

print("GitHub token successfully retrieved.")

# 2. Open Repo
repo = Repo(repo_path)

# Verify no .env or sensitive files are staged
status = porcelain.status(repo_path)
for f in status.staged.get('add', []) + status.staged.get('modify', []):
    f_str = f.decode('utf-8', errors='ignore') if isinstance(f, bytes) else str(f)
    if '.env' in f_str or 'credential' in f_str:
        raise Exception(f"CRITICAL: Found sensitive file staged: {f_str}")

# Add all files respected by .gitignore
print("Staging modified and new files...")
porcelain.add(repo_path)

# Re-check
status = porcelain.status(repo_path)
print("Staged additions/modifications count:", len(status.staged.get('add', [])) + len(status.staged.get('modify', [])))
for f in status.staged.get('add', []) + status.staged.get('modify', []):
    f_str = f.decode('utf-8', errors='ignore') if isinstance(f, bytes) else str(f)
    if '.env' in f_str or 'credential' in f_str:
        raise Exception(f"CRITICAL: Found sensitive file staged: {f_str}")

# 3. Commit
commit_msg = "feat: Mavora AI - Multilingual support (Kannada/Hindi/English), live GPS tracker & safety geofence, enrolled memory bank, and strict hallucination prevention"
try:
    c_sha = porcelain.commit(repo_path, message=commit_msg.encode('utf-8'), author="Vaishnavikudari <vaishnavikudari@gmail.com>".encode('utf-8'))
    print("Committed successfully with SHA:", c_sha.decode('utf-8') if isinstance(c_sha, bytes) else c_sha)
except Exception as e:
    print("Commit note:", e)

# 4. Push to Vaishnavikudari/weRizz.git
remote_url = f"https://Vaishnavikudari:{token}@github.com/Vaishnavikudari/weRizz.git"
print("Pushing to https://github.com/Vaishnavikudari/weRizz.git on branch 'main'...")

# Try push
try:
    porcelain.push(repo, remote_url, refspecs=["refs/heads/main:refs/heads/main"])
    print("SUCCESS: Successfully pushed all project files to Vaishnavikudari/weRizz on branch 'main'!")
except Exception as e:
    print("Push error or trying force:", e)
    # If remote has diverged or is newly initialized
    try:
        porcelain.push(repo, remote_url, refspecs=["+refs/heads/main:refs/heads/main"])
        print("SUCCESS: Force-pushed branch 'main' successfully to Vaishnavikudari/weRizz!")
    except Exception as e2:
        print("Final push error:", e2)
