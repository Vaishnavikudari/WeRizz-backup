with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix app-container CSS so it spans the true viewport height without bottom deadspace
old_css = '''.app-container {
            display: flex;
            height: 100%; /* CHANGED from 100vh to fit inside NavWrapper */
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
            color: var(--text);
            overflow: hidden;
            flex-direction: row; 
            width: 100%;
        }'''

new_css = '''.app-container {
            display: flex;
            height: calc(100vh - 70px);
            max-height: calc(100vh - 70px);
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            color: var(--text);
            overflow: hidden;
            flex-direction: row; 
            width: 100%;
        }'''

if old_css in text:
    text = text.replace(old_css, new_css)
else:
    print("Could not find old_css exactly, trying line replace")
    text = text.replace("height: 100%; /* CHANGED from 100vh to fit inside NavWrapper */", "height: calc(100vh - 70px); max-height: calc(100vh - 70px);")

# Also ensure main element doesn't inject empty padding or extra scroll
old_main = '<main className="relative z-10 flex-1 w-full overflow-y-auto overflow-x-hidden">'
new_main = '<main className="relative z-10 flex-1 w-full h-[calc(100vh-70px)] overflow-hidden">'
if old_main in text:
    text = text.replace(old_main, new_main)

# Adjust chat-zone so it takes 100% width cleanly
old_chat = '''.chat-zone {
            flex: 1;
            height: 100%;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            overflow: hidden;
            background: transparent;
        }'''
new_chat = '''.chat-zone {
            flex: 1;
            height: 100%;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            justify-content: stretch;
            align-items: stretch;
            overflow: hidden;
            background: transparent;
        }'''
if old_chat in text:
    text = text.replace(old_chat, new_chat)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESSFULLY OPTIMIZED FULL PAGE HEIGHT!")

