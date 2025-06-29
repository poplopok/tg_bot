from transformers import HubertForSequenceClassification, Wav2Vec2FeatureExtractor, AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F
import librosa
import io

class EmotionAnalyzer:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("MaxKazak/ruBert-base-russian-emotion-detection")
        self.text_model = AutoModelForSequenceClassification.from_pretrained("MaxKazak/ruBert-base-russian-emotion-detection")
        self.text_model.eval()
        self.text_id2label = self.text_model.config.id2label

        self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/hubert-large-ls960-ft")
        self.audio_model = HubertForSequenceClassification.from_pretrained("xbgoose/hubert-speech-emotion-recognition-russian-dusha-finetuned")
        self.audio_model.eval()
        self.num2emotion = {0: 'neutral', 1: 'angry', 2: 'positive', 3: 'sad', 4: 'other'}

    def analyze_text(self, text: str):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.text_model(**inputs)
        scores = F.softmax(outputs.logits, dim=1).squeeze()
        max_idx = torch.argmax(scores).item()
        return self.text_id2label[max_idx], scores[max_idx].item()

    def analyze_audio(self, audio_bytes: bytes, sampling_rate=16000):
        # Загружаем аудио из bytes, ресемплируем и конвертим в waveform
        wav, sr = librosa.load(io.BytesIO(audio_bytes), sr=sampling_rate)
        inputs = self.feature_extractor(wav, sampling_rate=sr, return_tensors="pt", padding=True, max_length=16000*10, truncation=True)

        with torch.no_grad():
            logits = self.audio_model(inputs['input_values']).logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
            pred_idx = torch.argmax(probs, dim=-1).item()
            score = probs[0, pred_idx].item()


        emotion = self.num2emotion.get(pred_idx, "unknown")
        return emotion, score
