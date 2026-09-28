Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = currentDir

' Start server silently in background
WshShell.Run "cmd /c node server/index.js", 0, False
WScript.Sleep 2000
WshShell.Run "http://localhost:5000"
