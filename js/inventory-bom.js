// ========================================
// BOM (Bill of Materials) 管理機能
// ========================================
// 作成日: 2026-01-04
// バージョン: 1.0
// 説明: 商品の部品構成を管理
// ========================================

let currentProductForBOM = null;
let bomData = [];

// ========================================
// BOM管理モーダルを開く
// ========================================
async function openBOMModal(productId) {
    try {
        // 商品情報を取得
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        currentProductForBOM = product;
        document.getElementById('bomProductName').textContent = product.name;

        // BOMデータを読み込み
        await loadBOMData(productId);

        // モーダルを表示
        document.getElementById('bomModal').style.display = 'block';

    } catch (error) {
        console.error('BOM管理モーダルオープンエラー:', error);
        alert('BOM管理画面の表示に失敗しました');
    }
}

// ========================================
// BOMデータの読み込み
// ========================================
async function loadBOMData(productId) {
    try {
        const { data, error } = await supabase
            .from('product_bom')
            .select(`
                *,
                parts (
                    id,
                    name,
                    current_stock,
                    unit,
                    unit_cost
                )
            `)
            .eq('product_id', productId)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        bomData = data || [];
        renderBOMTable();
        calculateManufacturableQuantity();

    } catch (error) {
        console.error('BOMデータ読み込みエラー:', error);
        alert('BOMデータの読み込みに失敗しました');
    }
}

// ========================================
// BOMテーブルのレンダリング
// ========================================
function renderBOMTable() {
    const kitTableBody = document.getElementById('bomKitTableBody');
    const userProvidedTableBody = document.getElementById('bomUserProvidedTableBody');

    // キット内容品と別途用意が必要な部品に分ける
    const kitParts = bomData.filter(bom => bom.category === 'kit');
    const userProvidedParts = bomData.filter(bom => bom.category === 'user_provided');

    // キット内容品テーブル
    if (kitParts.length === 0) {
        kitTableBody.innerHTML = '<tr><td colspan="6" class="no-data">キット内容品が登録されていません</td></tr>';
    } else {
        kitTableBody.innerHTML = kitParts.map(bom => {
            const part = bom.parts;
            const totalCost = part.unit_cost * bom.quantity;
            const manufacturableQty = Math.floor(part.current_stock / bom.quantity);

            return `
                <tr>
                    <td>${escapeHtml(part.name)}</td>
                    <td>${bom.quantity} ${escapeHtml(part.unit)}</td>
                    <td>${part.current_stock} ${escapeHtml(part.unit)}</td>
                    <td>${manufacturableQty}台分</td>
                    <td>¥${totalCost.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteBOMItem('${bom.id}')">削除</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 別途用意が必要な部品テーブル
    if (userProvidedParts.length === 0) {
        userProvidedTableBody.innerHTML = '<tr><td colspan="3" class="no-data">別途用意が必要な部品が登録されていません</td></tr>';
    } else {
        userProvidedTableBody.innerHTML = userProvidedParts.map(bom => {
            const part = bom.parts;

            return `
                <tr>
                    <td>${escapeHtml(part.name)}</td>
                    <td>${bom.quantity} ${escapeHtml(part.unit)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteBOMItem('${bom.id}')">削除</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// ========================================
// 製造可能数の計算（キット内容品のみで計算）
// ========================================
function calculateManufacturableQuantity() {
    // キット内容品のみで計算
    const kitParts = bomData.filter(bom => bom.category === 'kit');

    if (kitParts.length === 0) {
        document.getElementById('manufacturableQty').textContent = '0';
        document.getElementById('totalMaterialCost').textContent = '¥0';
        document.getElementById('shortageList').innerHTML = '<p class="no-data">キット内容品が登録されていません</p>';
        return;
    }

    // 各部品から製造可能数を計算（最小値が制約）
    let minManufacturable = Infinity;
    let totalCost = 0;
    const shortages = [];

    kitParts.forEach(bom => {
        const part = bom.parts;
        const manufacturableFromThisPart = Math.floor(part.current_stock / bom.quantity);

        if (manufacturableFromThisPart < minManufacturable) {
            minManufacturable = manufacturableFromThisPart;
        }

        totalCost += part.unit_cost * bom.quantity;

        // 在庫不足の部品を記録
        if (part.current_stock < bom.quantity) {
            const shortage = bom.quantity - part.current_stock;
            shortages.push({
                name: part.name,
                needed: bom.quantity,
                current: part.current_stock,
                shortage: shortage,
                unit: part.unit
            });
        }
    });

    if (minManufacturable === Infinity) {
        minManufacturable = 0;
    }

    // 表示更新
    document.getElementById('manufacturableQty').textContent = minManufacturable;
    document.getElementById('totalMaterialCost').textContent = '¥' + totalCost.toLocaleString();

    // 不足部品の表示
    const shortageList = document.getElementById('shortageList');
    if (shortages.length === 0) {
        shortageList.innerHTML = '<p class="no-data">不足部品はありません（キット内容品）</p>';
    } else {
        shortageList.innerHTML = shortages.map(s => `
            <div class="alert-item alert-danger">
                <strong>${escapeHtml(s.name)}</strong>:
                ${s.shortage}${escapeHtml(s.unit)}不足
                （必要: ${s.needed}${escapeHtml(s.unit)} / 現在: ${s.current}${escapeHtml(s.unit)}）
            </div>
        `).join('');
    }
}

// ========================================
// BOM部品追加モーダルを開く
// ========================================
async function openAddBOMPartModal() {
    try {
        // 部品一覧を取得
        const { data: parts, error } = await supabase
            .from('parts')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('name', { ascending: true });

        if (error) throw error;

        // 既に登録されている部品を除外
        const registeredPartIds = bomData.map(bom => bom.part_id);
        const availableParts = parts.filter(p => !registeredPartIds.includes(p.id));

        // セレクトボックスを生成
        const select = document.getElementById('bomPartSelect');
        select.innerHTML = '<option value="">部品を選択...</option>' +
            availableParts.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');

        // フォームをリセット
        document.getElementById('bomPartQuantity').value = '1';

        // モーダルを表示
        document.getElementById('addBOMPartModal').style.display = 'block';

    } catch (error) {
        console.error('部品選択モーダルオープンエラー:', error);
        alert('部品一覧の取得に失敗しました');
    }
}

// ========================================
// BOM部品追加モーダルを閉じる
// ========================================
function closeAddBOMPartModal() {
    document.getElementById('addBOMPartModal').style.display = 'none';
}

// ========================================
// BOM部品の追加
// ========================================
async function addBOMPart(event) {
    event.preventDefault();

    const partId = document.getElementById('bomPartSelect').value;
    const quantity = parseFloat(document.getElementById('bomPartQuantity').value);
    const category = document.getElementById('bomPartCategory').value;

    if (!partId) {
        alert('部品を選択してください');
        return;
    }

    if (quantity <= 0) {
        alert('数量は1以上を入力してください');
        return;
    }

    try {
        const { error } = await supabase
            .from('product_bom')
            .insert([{
                user_id: currentUser.id,
                product_id: currentProductForBOM.id,
                part_id: partId,
                quantity: quantity,
                category: category
            }]);

        if (error) throw error;

        closeAddBOMPartModal();
        await loadBOMData(currentProductForBOM.id);
        alert('部品を追加しました');

    } catch (error) {
        console.error('BOM部品追加エラー:', error);
        alert('部品の追加に失敗しました: ' + error.message);
    }
}

// ========================================
// BOM部品の削除
// ========================================
async function deleteBOMItem(bomId) {
    if (!confirm('この部品を削除しますか？')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('product_bom')
            .delete()
            .eq('id', bomId);

        if (error) throw error;

        await loadBOMData(currentProductForBOM.id);
        alert('部品を削除しました');

    } catch (error) {
        console.error('BOM部品削除エラー:', error);
        alert('部品の削除に失敗しました: ' + error.message);
    }
}

// ========================================
// BOMモーダルを閉じる
// ========================================
function closeBOMModal() {
    document.getElementById('bomModal').style.display = 'none';
    currentProductForBOM = null;
}

// ========================================
// イベントリスナーの設定
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // BOMモーダル閉じるボタン
    const closeBOMModalButton = document.getElementById('closeBOMModal');
    if (closeBOMModalButton) {
        closeBOMModalButton.addEventListener('click', closeBOMModal);
    }

    // BOM部品追加ボタン
    const addBOMPartButton = document.getElementById('addBOMPartButton');
    if (addBOMPartButton) {
        addBOMPartButton.addEventListener('click', openAddBOMPartModal);
    }

    // BOM部品追加モーダル閉じる
    const closeAddBOMPartModalButton = document.getElementById('closeAddBOMPartModal');
    if (closeAddBOMPartModalButton) {
        closeAddBOMPartModalButton.addEventListener('click', closeAddBOMPartModal);
    }

    // BOM部品追加フォーム送信
    const addBOMPartForm = document.getElementById('addBOMPartForm');
    if (addBOMPartForm) {
        addBOMPartForm.addEventListener('submit', addBOMPart);
    }

    // モーダル外クリックで閉じる
    const bomModal = document.getElementById('bomModal');
    if (bomModal) {
        bomModal.addEventListener('click', (e) => {
            if (e.target === bomModal) {
                closeBOMModal();
            }
        });
    }

    const addBOMPartModal = document.getElementById('addBOMPartModal');
    if (addBOMPartModal) {
        addBOMPartModal.addEventListener('click', (e) => {
            if (e.target === addBOMPartModal) {
                closeAddBOMPartModal();
            }
        });
    }
});
