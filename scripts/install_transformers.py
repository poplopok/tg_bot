"""
Установка необходимых библиотек для работы с transformers
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
    """Установка всех необходимых пакетов для transformers"""
    packages = [
        "torch",
        "transformers",
        "numpy",
        "tokenizers",
        "huggingface-hub",
        "safetensors",
        "accelerate"
    ]
    
    print("🚀 Начинаем установку библиотек для transformers...")
    print("📦 Будут установлены следующие пакеты:")
    for pkg in packages:
        print(f"   - {pkg}")
    print()
    
    success_count = 0
    for package in packages:
        print(f"📦 Устанавливаем {package}...")
        if install_package(package):
            success_count += 1
        print()
    
    print(f"✨ Установка завершена: {success_count}/{len(packages)} пакетов установлено успешно")
    
    if success_count == len(packages):
        print("🎉 Все библиотеки установлены! Можно запускать анализ эмоций.")
        print("\n🔧 Для тестирования запустите:")
        print("   python scripts/emotion_analysis_transformers.py test")
    else:
        print("⚠️ Некоторые библиотеки не удалось установить. Проверьте ошибки выше.")

if __name__ == "__main__":
    main()
