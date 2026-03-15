import winreg
import os

key_path = r"Environment"
try:
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_READ | winreg.KEY_WRITE) as key:
        value, reg_type = winreg.QueryValueEx(key, "Path")
        if r"C:\Program Files\Git\cmd" not in value:
            new_path = value.strip(";") + r";C:\Program Files\Git\cmd"
            winreg.SetValueEx(key, "Path", 0, reg_type, new_path)
            print("Successfully added Git to User PATH")
        else:
            print("Git is already in User PATH")
except Exception as e:
    print(f"Error: {e}")
