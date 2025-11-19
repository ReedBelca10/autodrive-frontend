import sys
p='c:/Users/ReedBelca/Documents/Projets/emefa/lib/screens/form_screen.dart'
with open(p,encoding='utf-8') as f:
    lines=f.readlines()
stack=[]
for i,line in enumerate(lines, start=1):
    for j,ch in enumerate(line, start=1):
        if ch=='(':
            stack.append((i,j,line.strip()))
        elif ch==')':
            if stack:
                stack.pop()
            else:
                print('Unmatched ) at',i,j)
                sys.exit(0)
if stack:
    print('Unmatched ( count',len(stack))
    print('Full unmatched stack (bottom->top):')
    for item in stack:
        print(item)
    print('Top unmatched at',stack[-1])
else:
    print('All matched')
