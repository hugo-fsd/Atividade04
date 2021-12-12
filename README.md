# Atividade04
 
Web scrapping API integrado com frontend e sistema de Login/Registo.

Toda a informação esta apresentada no website e o user não tem de fazer nada para aceder à mesma. 

Pode alterar o número de entradas da tabela ao alterar o valor X onde diz "Show X entries" e pode pesquisar ao inserir o nome que pretende na search bar. 

Pode também aceder ao JSON original (caso queira) metendo "/api/gpus/" no final do link.


Após registar uma conta está tem de ser confirmada, como não pretendo enviar emails de modo a não enviar spam aos avaliadores gerei apenas o link de confirmação na página após registar. O avaliador deve copiar e colar o link gerado no registo de um user, ao aceder a este link o user fica autorizado e fica possivel fazer login com essa conta. Este link pode ser encontrado na consola do web browser ou na popup do registo (imagem representativa aqui -> https://imgur.com/528NgyV). 

Para correr o projecto o avaliador deve abrir o repo no editor que preferir, abrir o terminal e escrever:

```
npm i
```
e de seguida fazer:

```
npm run start
```
