"""
Скрипт для установки необходимых Python библиотек
"""

import subprocess
import sys

def install_package(package):
    """Установка пакета через pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} установлен успешно")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Ошибка установки {package}: {e}")
        return False

def main():
    """Установка всех необходимых пакетов"""
    packages = [
        "torch",
        "transformers",
        "numpy",
        "tokenizers",
        "huggingface-hub"
    ]
    
    print("🚀 Начинаем установку Python библиотек для анализа эмоций...")
    
    success_count = 0
    for package in packages:
        print(f"\n📦 Устанавливаем {package}...")
        if install_package(package):
            success_count += 1
    
    print(f"\n✨ Установка завершена: {success_count}/{len(packages)} пакетов установлено успешно")
    
    if success_count == len(packages):
        print("🎉 Все библиотеки установлены! Можно запускать анализ эмоций.")
    else:
        print("⚠️ Некоторые библиотеки не удалось установить. Проверьте ошибки выше.")

if __name__ == "__main__":
    main()
