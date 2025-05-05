# Instruções para Conectar seu Projeto Firebase

Para que o sistema de cardápio funcione corretamente, você precisa conectar este projeto Next.js ao seu próprio projeto Firebase. Siga os passos abaixo:

**1. Acesse o Console do Firebase:**
   - Vá para [https://console.firebase.google.com/](https://console.firebase.google.com/).
   - Faça login com sua conta Google.

**2. Crie ou Selecione um Projeto Firebase:**
   - Clique em "Adicionar projeto" para criar um novo projeto ou selecione um projeto existente onde deseja hospedar este sistema.
   - Siga as instruções na tela para configurar o projeto (nome, Google Analytics opcional, etc.).

**3. Ative os Serviços Necessários:**
   No menu lateral esquerdo do seu projeto Firebase, vá para a seção "Build" e ative os seguintes serviços:
   - **Authentication:**
     - Clique em "Authentication".
     - Clique em "Começar".
     - Na aba "Sign-in method", habilite o provedor "E-mail/senha".
   - **Firestore Database:**
     - Clique em "Firestore Database".
     - Clique em "Criar banco de dados".
     - Selecione "Iniciar no modo de produção" (as regras que forneci restringem o acesso inicial).
     - Escolha um local para o seu banco de dados (selecione a região mais próxima dos seus usuários).
     - Clique em "Ativar".
   - **Storage:**
     - Clique em "Storage".
     - Clique em "Começar".
     - Siga as regras de segurança sugeridas (clique em "Próxima").
     - Escolha um local para o seu bucket do Storage (geralmente o mesmo local do Firestore).
     - Clique em "Concluído".
   - **Functions:**
     - Clique em "Functions".
     - Clique em "Começar" (pode ser necessário atualizar seu plano para o plano Blaze "Pay as you go", que geralmente tem um nível gratuito generoso, para usar Functions).

**4. Registre seu Aplicativo Web:**
   - Volte para a página principal do seu projeto (clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto" e selecione "Configurações do projeto").
   - Na aba "Geral", role para baixo até a seção "Seus apps".
   - Clique no ícone da Web (`</>`) para adicionar um novo aplicativo da Web.
   - Dê um apelido ao seu aplicativo (ex: "Cardapio Web App").
   - **Não** marque a opção "Configurar também o Firebase Hosting para este app" por enquanto.
   - Clique em "Registrar app".

**5. Obtenha as Credenciais do Firebase:**
   - Após registrar o app, o Firebase exibirá o objeto `firebaseConfig`.
   - **Copie este objeto inteiro.** Ele se parecerá com isto:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "seu-projeto.firebaseapp.com",
       projectId: "seu-projeto-id",
       storageBucket: "seu-projeto.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234567890:web:abcdef123456"
     };
     ```

**6. Configure o Projeto Local:**
   - **Arquivo de Configuração do Frontend:**
     - Abra o arquivo `/home/ubuntu/menu-saas/src/lib/firebaseConfig.js` que eu criei.
     - **Substitua** o objeto `firebaseConfig` de exemplo pelo objeto que você copiou do console do Firebase no passo anterior.
     - Salve o arquivo.
   - **Arquivo de Configuração do Projeto Firebase:**
     - Abra o arquivo `/home/ubuntu/menu-saas/.firebaserc` que eu criei.
     - No console do Firebase, vá para "Configurações do projeto" (ícone de engrenagem ⚙️).
     - Copie o **ID do projeto** (Project ID).
     - Cole o ID do projeto no arquivo `.firebaserc`, substituindo `"YOUR_FIREBASE_PROJECT_ID"`.
     - Salve o arquivo. Ele deve ficar assim (com seu ID real):
       ```json
       {
         "projects": {
           "default": "seu-projeto-id"
         }
       }
       ```

**7. (Opcional/Avançado) Deploy das Regras de Segurança:**
   - Os arquivos `firestore.rules` e `storage.rules` já estão no projeto com regras de segurança iniciais.
   - Para aplicá-las ao seu projeto Firebase, você precisaria instalar o Firebase CLI localmente (se ainda não o fez), fazer login (`firebase login`) e então executar o comando `firebase deploy --only firestore:rules,storage` dentro do diretório `/home/ubuntu/menu-saas` (ou no seu ambiente local após baixar o código).

**Pronto!** Após seguir estes passos, o projeto estará conectado à sua conta Firebase e pronto para que eu continue o desenvolvimento das funcionalidades.

Se tiver qualquer dúvida durante o processo, me avise!
