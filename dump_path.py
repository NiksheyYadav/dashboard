import winreg
key_path = r"Environment"
try:
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_READ) as key:
        value, _ = winreg.QueryValueEx(key, "Path")
        with open('path_output.txt', 'w') as f:
            f.write(value)
except Exception as e:
    print(e)
