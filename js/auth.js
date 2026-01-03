// ========================================
// 認証ヘルパー関数
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: 認証に関する共通関数を提供
// ========================================

/**
 * 現在のログインユーザーを取得
 * @returns {Promise<Object|null>} ユーザーオブジェクト、または未ログインの場合はnull
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('ユーザー取得エラー:', error);
            return null;
        }

        return user;
    } catch (error) {
        console.error('ユーザー取得エラー:', error);
        return null;
    }
}

/**
 * ログイン状態をチェックして、未ログインの場合はログインページへリダイレクト
 * @returns {Promise<Object>} ログインユーザーオブジェクト
 */
async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        // 未ログインの場合はログインページへリダイレクト
        window.location.href = 'login.html';
        throw new Error('認証が必要です');
    }

    return user;
}

/**
 * ログアウト処理
 * @returns {Promise<void>}
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('ログアウトエラー:', error);
            alert('ログアウトに失敗しました');
            return;
        }

        // ログアウト成功後、ログインページへリダイレクト
        window.location.href = 'login.html';
    } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウトに失敗しました');
    }
}

/**
 * ユーザー情報を表示用にフォーマット
 * @param {Object} user - ユーザーオブジェクト
 * @returns {Object} フォーマット済みユーザー情報
 */
function formatUserInfo(user) {
    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        avatar: user.user_metadata?.avatar_url || null
    };
}

/**
 * 認証状態の変更を監視
 * @param {Function} callback - 認証状態が変更された時に呼ばれるコールバック関数
 */
function onAuthStateChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('認証状態変更:', event, session);
        callback(event, session);
    });
}

/**
 * UIにユーザー情報を表示
 * @param {Object} user - ユーザーオブジェクト
 */
function displayUserInfo(user) {
    const userInfoElement = document.getElementById('userInfo');
    if (!userInfoElement) return;

    const userInfo = formatUserInfo(user);

    if (userInfo) {
        userInfoElement.innerHTML = `
            <div class="user-profile">
                ${userInfo.avatar ? `<img src="${userInfo.avatar}" alt="User Avatar" class="user-avatar">` : ''}
                <span class="user-name">${userInfo.name}</span>
            </div>
        `;
    }
}

// ========================================
// エクスポート（グローバルスコープ）
// ========================================
window.authHelpers = {
    getCurrentUser,
    requireAuth,
    signOut,
    formatUserInfo,
    onAuthStateChange,
    displayUserInfo
};
