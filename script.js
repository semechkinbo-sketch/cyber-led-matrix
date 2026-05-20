const textInput = document.getElementById('text-input');
const colorPicker = document.getElementById('color-picker');
const colorPreviewNode = document.getElementById('color-preview-node');
const colorHexText = document.getElementById('color-hex-text');
const fontSelect = document.getElementById('font-select');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');

const ledText = document.getElementById('led-output');
const ledOverlay = document.getElementById('led-overlay');
const ledScreenNode = document.getElementById('led-screen-node');
const statusNode = document.getElementById('status-node');
const fsTarget = document.getElementById('fullscreen-target');
const manualFsBtn = document.getElementById('manual-fs-btn');

// Набор Пресетов (Темы в 1 клик)
const PRESETS = {
	matrix: {
		text: "FOLLOW THE WHITE RABBIT //",
		color: "#00ff33",
		font: "'Courier New', monospace",
		speed: "8",
		size: "4"
	},
	cyber: {
		text: "NIGHT CITY NIGHTS 🔥",
		color: "#fcee0a",
		font: "'Impact', sans-serif",
		speed: "16",
		size: "6"
	},
	danger: {
		text: "CRITICAL ALERT ⚠️ SYSTEM OVERLOAD //",
		color: "#ff0055",
		font: "system-ui, sans-serif",
		speed: "20",
		size: "5"
	}
};

// Функция синхронизации и обновления UI
function updateGlobalUI(color, isPreset = false) {
	document.documentElement.style.setProperty('--accent-color', color);
	ledText.style.color = color;
	colorPreviewNode.style.background = color;
	colorPreviewNode.style.boxShadow = `0 0 12px ${color}`;
	colorHexText.innerText = color.toUpperCase();
	statusNode.style.boxShadow = `0 0 10px ${color}`;
	statusNode.style.background = `${color}15`;
	statusNode.style.color = color;

	if (isPreset) {
		// Эффект помех при переключении пресетов
		ledScreenNode.classList.add('glitch-active');
		statusNode.innerText = "UPDATED";
		setTimeout(() => {
			ledScreenNode.classList.remove('glitch-active');
			statusNode.innerText = "READY";
		}, 300);
	}
	saveSettings();
}

// Функции для работы с LocalStorage (Сохранение настроек)
function saveSettings() {
	const config = {
		text: textInput.value,
		color: colorPicker.value,
		font: fontSelect.value,
		speed: speedSlider.value,
		size: sizeSlider.value
	};
	localStorage.setItem('cyberMatrixConfig', JSON.stringify(config));
}

function loadSettings() {
	const saved = localStorage.getItem('cyberMatrixConfig');
	if (!saved) {
		updateGlobalUI(colorPicker.value);
		return;
	}
	
	const config = JSON.parse(saved);
	
	// Восстанавливаем значения в инпутах панели
	textInput.value = config.text;
	colorPicker.value = config.color;
	fontSelect.value = config.font;
	speedSlider.value = config.speed;
	sizeSlider.value = config.size;

	// Применяем настройки к матрице дисплея
	ledText.innerText = config.text ? config.text : " ";
	ledText.style.fontFamily = config.font;
	ledText.style.animationDuration = `${25 - config.speed}s`;
	ledOverlay.style.backgroundSize = `${config.size}px ${config.size}px`;
	
	updateGlobalUI(config.color);
}

// Слушатели событий управления панели
textInput.addEventListener('input', (e) => {
	ledText.innerText = e.target.value ? e.target.value : " ";
	saveSettings();
});

colorPicker.addEventListener('input', (e) => {
	updateGlobalUI(e.target.value);
});

fontSelect.addEventListener('change', (e) => {
	ledText.style.fontFamily = e.target.value;
	saveSettings();
});

speedSlider.addEventListener('input', (e) => {
	ledText.style.animationDuration = `${25 - e.target.value}s`;
	saveSettings();
});

sizeSlider.addEventListener('input', (e) => {
	ledOverlay.style.backgroundSize = `${e.target.value}px ${e.target.value}px`;
	saveSettings();
});

// Активация Пресетов
document.querySelectorAll('.preset-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		const presetName = btn.getAttribute('data-preset');
		const data = PRESETS[presetName];
		
		if (!data) return;

		textInput.value = data.text;
		colorPicker.value = data.color;
		fontSelect.value = data.font;
		speedSlider.value = data.speed;
		sizeSlider.value = data.size;

		ledText.innerText = data.text;
		ledText.style.fontFamily = data.font;
		ledText.style.animationDuration = `${25 - data.speed}s`;
		ledOverlay.style.backgroundSize = `${data.size}px ${data.size}px`;

		updateGlobalUI(data.color, true);
	});
});


// --- НАДЁЖНЫЙ FULLSCREEN ТРИГГЕР (РОВНО 2 ТАПА) ---

function toggleFullscreen() {
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	if (isIOS) {
		fsTarget.classList.toggle('ios-fullscreen-fallback');
		updateBtnText();
		return;
	}

	if (!document.fullscreenElement && !document.webkitFullscreenElement) {
		if (fsTarget.requestFullscreen) {
			fsTarget.requestFullscreen();
		} else if (fsTarget.webkitRequestFullscreen) {
			fsTarget.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}

// Быстрый двойной тап для телефонов через touchstart
let lastTap = 0;
fsTarget.addEventListener('touchstart', (e) => {
	const currentTime = new Date().getTime();
	const tapLength = currentTime - lastTap;
	
	if (tapLength < 300 && tapLength > 0) {
		e.preventDefault(); 
		toggleFullscreen();
	}
	lastTap = currentTime;
}, { passive: false });

fsTarget.addEventListener('dblclick', toggleFullscreen);
manualFsBtn.addEventListener('click', toggleFullscreen);

function updateBtnText() {
	const hasHtmlFS = document.fullscreenElement || document.webkitFullscreenElement;
	const hasIosFS = fsTarget.classList.contains('ios-fullscreen-fallback');

	if (hasHtmlFS || hasIosFS) {
		manualFsBtn.innerText = "Вернуть обычный режим";
	} else {
		manualFsBtn.innerText = "Развернуть во весь экран";
	}
}

document.addEventListener('fullscreenchange', updateBtnText);
document.addEventListener('webkitfullscreenchange', updateBtnText);

// Инициализация проекта при загрузке страницы
loadSettings();