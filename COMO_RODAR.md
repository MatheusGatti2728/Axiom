# AXIOM — Como rodar localmente

## Primeira vez (ou após receber novo zip):

```
1. Extraia o zip em C:\Users\Pichau\Downloads\
2. Clique duas vezes em START.bat
3. Quando perguntar "Deseja finalizar (S/N)?" → N + Enter
4. Abra http://localhost:3000/dashboard
```

## Se der erro de compilação:

```cmd
cd C:\Users\Pichau\Downloads\axiom
rmdir /s /q .next
npm run dev
```
