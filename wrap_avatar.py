with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '<div className="main-stage">\n          {/* Floating Robot Assistant in corner */}\n          <AvatarCanvas isSpeaking={isSpeaking} isProcessing={isProcessing} processingStatus={processingStatus} message={avatarMessage} />\n          <div className="chat-zone">'

replacement = '<div className="main-stage">\n          <div className="avatar-zone">\n            <AvatarCanvas isSpeaking={isSpeaking} isProcessing={isProcessing} processingStatus={processingStatus} message={avatarMessage} />\n          </div>\n          <div className="chat-zone">'

if target in text:
    text = text.replace(target, replacement)
    with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("SUCCESSFULLY WRAPPED AVATAR IN AVATAR-ZONE!")
else:
    print("TARGET NOT MATCHED!")

