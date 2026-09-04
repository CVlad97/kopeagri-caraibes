#!/usr/bin/env python3
"""
KopéAgri Caraïbes — Supabase Setup Script
Exécute le schema SQL + crée le bucket photos + configure Auth

Usage:
  python3 setup-supabase.py

Prérequis:
  pip install psycopg2-binary supabase
"""
import os
import sys

# ============================================================
# CONFIGURATION — Remplace par tes vraies valeurs
# ============================================================
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://boihlgodmclljtckhmgz.supabase.co')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')  # sbp_cd...
DB_PASSWORD = os.environ.get('SUPABASE_DB_PASSWORD', '')  # Same as service key
PROJECT_REF = 'boihlgodmclljtckhmgz'

SCHEMA_FILE = os.path.join(os.path.dirname(__file__), 'supabase', 'schema-production.sql')

def step1_execute_sql():
    """Étape 1: Exécuter le schema SQL via psycopg2"""
    if not DB_PASSWORD:
        print("⚠️  DB_PASSWORD non défini — saute l'exécution SQL directe")
        print("   → Exécute le SQL manuellement dans le Dashboard Supabase:")
        print("   → Dashboard → SQL Editor → Colle supabase/schema-production.sql → Run")
        return False
    
    import psycopg2
    
    conn_str = f"postgresql://postgres.{PROJECT_REF}:{DB_PASSWORD}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
    
    print(f"📡 Connexion à Supabase ({PROJECT_REF})...")
    try:
        conn = psycopg2.connect(conn_str, connect_timeout=15)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Read schema SQL
        with open(SCHEMA_FILE, 'r') as f:
            sql = f.read()
        
        print(f"📝 Exécution du schema ({len(sql)} chars)...")
        cur.execute(sql)
        
        cur.close()
        conn.close()
        print("✅ Schema SQL exécuté avec succès!")
        return True
    except Exception as e:
        print(f"❌ Erreur SQL: {e}")
        return False

def step2_create_bucket():
    """Étape 2: Créer le bucket photos via Supabase API"""
    try:
        from supabase import create_client
        
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            print("⚠️  Clés non définies — skip bucket creation")
            print("   → Dashboard → Storage → New bucket → Nom: 'photos', Public: No")
            return False
        
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Create bucket
        try:
            result = client.storage.create_bucket('photos', {'public': False})
            print(f"✅ Bucket 'photos' créé: {result}")
        except Exception as e:
            if 'already exists' in str(e).lower():
                print("✅ Bucket 'photos' existe déjà")
            else:
                print(f"⚠️  Bucket creation: {e}")
        
        return True
    except ImportError:
        print("⚠️  supabase-py non installé — pip install supabase")
        return False

def step3_verify():
    """Étape 3: Vérifier que les tables existent"""
    if not DB_PASSWORD:
        print("⚠️  Pas de vérification possible sans DB_PASSWORD")
        return
    
    import psycopg2
    
    conn_str = f"postgresql://postgres.{PROJECT_REF}:{DB_PASSWORD}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
    
    try:
        conn = psycopg2.connect(conn_str, connect_timeout=15)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """)
        tables = [row[0] for row in cur.fetchall()]
        
        expected = ['profiles', 'producteurs', 'logistics_providers', 'distributors',
                    'parcelles', 'resources', 'bookings', 'lots', 'orders',
                    'rfq', 'rfq_partners', 'billing_documents', 'billing_lines',
                    'subscriptions', 'commissions', 'notifications',
                    'qonto_transactions', 'price_references', 'audit_log', 'document_counters']
        
        print(f"\n📊 Tables trouvées ({len(tables)}):")
        for t in tables:
            status = "✅" if t in expected else "⚠️ "
            print(f"  {status} {t}")
        
        missing = [t for t in expected if t not in tables]
        if missing:
            print(f"\n❌ Tables manquantes: {missing}")
        else:
            print(f"\n✅ Toutes les {len(expected)} tables sont présentes!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Vérification échouée: {e}")

def main():
    print("=" * 60)
    print("🌴 KopéAgri Caraïbes — Supabase Setup")
    print("=" * 60)
    
    print("\n📌 ÉTAPE 1: Exécution du schema SQL")
    step1_execute_sql()
    
    print("\n📌 ÉTAPE 2: Création du bucket photos")
    step2_create_bucket()
    
    print("\n📌 ÉTAPE 3: Vérification")
    step3_verify()
    
    print("\n" + "=" * 60)
    print("📌 ÉTAPE 4 (manuelle): Activer Auth Email/Password")
    print("   → Dashboard → Authentication → Providers → Enable Email")
    print("=" * 60)

if __name__ == '__main__':
    main()
