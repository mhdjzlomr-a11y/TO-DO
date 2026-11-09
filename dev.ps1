$env:Path = "C:\Users\HP\nodejs;" + $env:Path
Set-Location "C:\Users\HP\Downloads\TO-DO"
& "C:\Users\HP\Downloads\TO-DO\node_modules\.bin\next.cmd" dev -H 0.0.0.0 -p 3000
