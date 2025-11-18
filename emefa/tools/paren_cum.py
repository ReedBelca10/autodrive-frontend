p='c:/Users/ReedBelca/Documents/Projets/emefa/lib/screens/form_screen.dart'
with open(p,encoding='utf-8') as f:
    lines=f.readlines()
count=0
for i,line in enumerate(lines, start=1):
    for ch in line:
        if ch=='(':
            count+=1
        elif ch==')':
            count-=1
    if i%10==0 or count<0 or '(' in line or ')' in line:
        print(f"{i:04}: count={count}    {line.rstrip()}")
print('FINAL',count)
