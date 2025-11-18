p='c:/Users/ReedBelca/Documents/Projets/emefa/lib/screens/form_screen.dart'
with open(p,encoding='utf-8') as f:
    lines=f.readlines()
stack=[]
maxdepth=0
maxat=None
for i,line in enumerate(lines, start=1):
    for j,ch in enumerate(line, start=1):
        if ch=='(':
            stack.append((i,j,line.strip()))
            if len(stack)>maxdepth:
                maxdepth=len(stack)
                maxat=(i,j,line.strip())
        elif ch==')':
            if stack:
                stack.pop()
            else:
                print('Unmatched ) at',i,j)
                raise SystemExit
print('max depth',maxdepth,'at',maxat)
print('remaining unmatched',len(stack))
if stack:
    print('top unmatched',stack[-1])
