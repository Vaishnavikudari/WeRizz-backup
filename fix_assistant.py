with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import FloatingAssistant from './components/FloatingAssistant';", "import AvatarCanvas from './components/AvatarCanvas';")
text = text.replace("<FloatingAssistant isSpeaking={isSpeaking} isProcessing={isProcessing} processingStatus={processingStatus} message={avatarMessage} />", "<AvatarCanvas isSpeaking={isSpeaking} isProcessing={isProcessing} processingStatus={processingStatus} message={avatarMessage} />")

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("SUCCESSFULLY REPLACED AVATARCANVAS")

