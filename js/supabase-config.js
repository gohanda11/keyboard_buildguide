// ========================================
// Supabase設定ファイル
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: Supabaseクライアントの初期化と設定
// ========================================

// ⚠️ 重要: 以下の値を実際のSupabaseプロジェクトの値に置き換えてください
// Supabase Settings → API で確認できます

const SUPABASE_URL = 'https://bxnrynutecdffxapbesr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bnJ5bnV0ZWNkZmZ4YXBiZXNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTQ0NDEsImV4cCI6MjA4MzAzMDQ0MX0.uq7J_fjAMe1WPNblK0gPGjxfuj_rS0p_0Uz7T8yUdUw';

// Supabaseクライアント初期化
try {
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
        // window.supabaseを使用してクライアントを作成し、グローバル変数を上書き
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('✅ Supabase client initialized successfully');
    } else {
        console.error('❌ Supabase設定が未設定です。SUPABASE_SETUP.mdを参照してください。');
        alert('Supabase設定が未設定です。管理者に連絡してください。');
    }
} catch (error) {
    console.error('❌ Supabase初期化エラー:', error);
    alert('Supabaseの初期化に失敗しました。詳細はコンソールを確認してください。');
}

// ========================================
// セットアップガイド
// ========================================
//
// 1. Supabaseプロジェクトを作成
//    https://supabase.com
//
// 2. Project URLとANON KEYを取得
//    Settings → API で確認
//
// 3. 上記の値を置き換え:
//    SUPABASE_URL: Project URL
//    SUPABASE_ANON_KEY: anon public key
//
// 4. database-schema.sqlを実行
//    SQL Editorで実行してテーブルを作成
//
// 詳細は SUPABASE_SETUP.md を参照してください。
//
// ========================================
