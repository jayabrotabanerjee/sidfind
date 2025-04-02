import struct
import json
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import sys

ENCRYPTION_KEY = b'jayabrota'

def decrypt(encrypted_text, key):
    encrypted_text = base64.b64decode(encrypted_text)
    cipher = AES.new(key, AES.MODE_CBC, iv=encrypted_text[:16])
    decrypted_text = unpad(cipher.decrypt(encrypted_text[16:]), AES.block_size)
    return decrypted_text.decode('utf-8')

def save_to_file(data):
    downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
    file_path = os.path.join(downloads_folder, "history.txt")
    with open(file_path, "a") as file:
        file.write(data + "\n")

def main():
    text_length_bytes = sys.stdin.buffer.read(4)
    text_length = struct.unpack('@I', text_length_bytes)[0]
    text = sys.stdin.buffer.read(text_length).decode('utf-8')

    decrypted_data = decrypt(text, ENCRYPTION_KEY)
    save_to_file(decrypted_data)

    response = {
        "success": True
    }
    response_bytes = json.dumps(response).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('@I', len(response_bytes)))
    sys.stdout.buffer.write(response_bytes)
    sys.stdout.buffer.flush()

if __name__ == "__main__":
    main()