/**
 * 部品データベースから部品情報を読み込んで表示する
 * @param {string} keyboardId - キーボードID (例: 'soa44', 'soa39')
 * @param {string} targetElementId - 表示先のHTML要素ID
 */
function loadKeyboardParts(keyboardId, targetElementId) {
  try {
    // parts-database.jsから読み込んだグローバル変数を使用
    const data = partsDatabase;

    const keyboard = data.keyboards[keyboardId];
    if (!keyboard) {
      console.error(`キーボードID "${keyboardId}" が見つかりません`);
      return;
    }

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
      console.error(`要素ID "${targetElementId}" が見つかりません`);
      return;
    }

    let html = '<ul>';

    keyboard.parts.forEach(partItem => {
      const part = data.parts[partItem.id];
      if (!part) {
        console.warn(`部品ID "${partItem.id}" が見つかりません`);
        return;
      }

      // 部品名と数量
      html += `<li>${part.name} <span style="background: #df7919; color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; margin-left: 0.5rem;">${partItem.quantity}${partItem.unit}</span>`;

      // 購入先リンク
      if (part.suppliers && part.suppliers.length > 0) {
        html += '<div style="margin-top: 0.5rem; padding-left: 1rem;">';
        html += '<span style="font-size: 0.9rem; color: #666;">購入先：</span>';
        part.suppliers.forEach((supplier, index) => {
          if (index > 0) {
            html += '<span style="color: #999;"> | </span>';
          }
          html += `<a href="${supplier.url}" target="_blank" style="color: #667eea; text-decoration: none; margin: 0 0.5rem;">${supplier.name}</a>`;
        });
        html += '</div>';
      }

      // 説明文
      if (part.description) {
        html += `<div style="margin-top: 0.5rem; padding-left: 1rem; font-size: 0.9rem; color: #666;">※${part.description}</div>`;
      }

      // 警告メッセージ
      if (part.warning) {
        html += '<div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 1rem; border-radius: 8px; margin: 0.5rem 0 0 1rem;">';
        html += '<strong>⚠️ 注意</strong><br>';
        html += part.warning;
        html += '</div>';
      }

      // 情報メッセージ
      if (part.info) {
        html += '<div style="background: #e7f3ff; border: 1px solid #b3d9ff; color: #0066cc; padding: 1rem; border-radius: 8px; margin: 0.5rem 0 0 1rem;">';
        html += '<strong>ℹ️ 情報</strong><br>';
        html += part.info;
        html += '</div>';
      }

      html += '</li>';
    });

    html += '</ul>';
    targetElement.innerHTML = html;

  } catch (error) {
    console.error('部品データの読み込みに失敗しました:', error);
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.innerHTML = '<p style="color: #dc3545;">部品データの読み込みに失敗しました。parts-database.jsが正しく読み込まれているか確認してください。</p>';
    }
  }
}
