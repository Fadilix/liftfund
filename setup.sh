#!/bin/bash

echo "🚀 Configuration rapide de l'API Caleb"
echo "======================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL n'est pas détecté. Assurez-vous qu'il est installé et démarré."
fi

echo "📦 Installation des dépendances..."
pnpm install

echo "🔧 Configuration de l'environnement..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé. Pensez à le modifier avec vos vraies valeurs."
else
    echo "✅ Fichier .env existe déjà."
fi

echo "🗄️  Génération du client Prisma..."
npx prisma generate

echo "✅ Configuration terminée !"
echo ""
echo "🔍 Prochaines étapes:"
echo "1. Configurez votre base de données PostgreSQL"
echo "2. Modifiez le fichier .env avec vos données"
echo "3. Créez la base de données: createdb api_caleb"
echo "4. Exécutez les migrations: pnpm run db:migrate"
echo "5. Créez un admin: npx tsx scripts/create-admin.ts"
echo "6. Démarrez l'API: pnpm run dev"
echo ""
echo "📚 Consultez README.md pour plus d'informations."
