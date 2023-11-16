//globals
var statepause = 'play';
var stateff = false;
var isMobile = false;
var actioncontrolorient = false; //false-> horizontal, true-> vertical
var virtualControlsEnabled = false;
var autoPaused = false;
var initialLoad = true;
//get query params for automatically selecting a rom
var params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop)
});
var query_select_rom = params.rom;
var query_select_save = params.save;
var accesstoken = null;
var islandscape = false;
var debugShortCircuit = false;
//attempt to initially refresh an access token from a present httponly cookie
refreshAccessToken();

//instanciate emulator
var emulator = processCoreChoiceConf();
if (emulator.invalid) {
	console.log('failed to create emulator:', emulator.errors);
}

//set controls based on core defaults
processEmulatorDefaultKeyBindings();

//set current save state value from localStorage
$('#savestateslot').val(localStorage.getItem('current-save-state-slot') || 0);

//set extra controls conf UI initial state from localStorage
processExtraControlsConf(false);

window.mobileCheck = function () {
	let check = false;
	(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4)
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

//pause canvas animation if windows is not focused, restart if so
$(window).focus(function () {
	if (emulator.IsDebugActive() || debugShortCircuit) {
		return;
	}
	if (emulator.IsRunning() && autoPaused) {
		buttonPlayPress(false);
		autoPaused = false;
	}
});

$(window).blur(function () {
	if (emulator.IsDebugActive() || debugShortCircuit) {
		return;
	}
	if (emulator.IsRunning() && !emulator.GetPaused() && !autoPaused) {
		buttonPlayPress(false);
		autoPaused = true;
	}
});

var menu_btn = document.querySelector('#menu-btn');
var sidebar = document.querySelector('#sidebar');
var container = document.querySelector('.nav-container');

var dpad_right = document.querySelector('#dpadholder > nav > div.right');
var dpad_up = document.querySelector('#dpadholder > nav > div.up');
var dpad_left = document.querySelector('#dpadholder > nav > div.left');
var dpad_down = document.querySelector('#dpadholder > nav > div.down');
var dpad_a_button = document.querySelector('#dpadabutton');
var dpad_b_button = document.querySelector('#dpadbbutton');
var dpad_l_button = document.querySelector('#dpadlbutton');
var dpad_r_button = document.querySelector('#dpadrbutton');
var dpad_start_button = document.querySelector('#dpadstartbutton');
var dpad_select_button = document.querySelector('#dpadselectbutton');

//check for mobile
if (window.mobileCheck()) {
	window.oncontextmenu = function () {
		return false;
	};
	isMobile = true;
	handleOrientationChange(window.orientation, true);
	$('#sidenavcleardismiss').toggle('active');
	enableVirtualControls();
	disableVirtualControlsMenuNode();
}

//login handlers
$('#loginModalButton').click(function () {
	emulator.DisableKeyboardInput();
});

$('#loginModal').on('hide.bs.modal', function () {
	emulator.EnableKeyboardInput();
});

$('#manageSaveStatesButton').click(function () {
	emulator.DisableKeyboardInput();
});

$('#saveStatesModal').on('hide.bs.modal', function () {
	emulator.EnableKeyboardInput();
});

$('#manageCheatsButton').click(function () {
	emulator.DisableKeyboardInput();
});

$('#manageCheatsModal').on('show.bs.modal', function () {
	processEmulatorCheats();
});

$('#manageCheatsModal').on('hide.bs.modal', function () {
	emulator.EnableKeyboardInput();
});

$('#loginForm').on('submit', function (e) {
	e.preventDefault();
	login();
});

//rom/save list handlers
$('#listRomModal').on('show.bs.modal', function () {
	loadRomList();
});

$('#listSaveModal').on('show.bs.modal', function () {
	loadSaveList();
});

// loads rom/save from query parameters
function initialParamRomandSave() {
	if (query_select_rom != null && query_select_rom != '') {
		if (query_select_save != null && query_select_save != '') {
			loadAndRunLocalRom(query_select_rom, query_select_save);
		} else {
			loadAndRunLocalRom(query_select_rom, '');
		}
	}
}

//make canvas wrapper/canvas draggable and resizable
$('#screenwrapper')
	.draggable()
	.resizable({
		handles: 'se,e',
		aspectRatio: 3 / 2
	});
$('#actioncontrolpanel').draggable();
$('#dpadholder').draggable({
	handle: '#dpadhandle'
});
$('#dpadabbuttonholder').draggable({
	handle: '#abbuttonhandle'
});
$('#dpadstartselectbuttonholder').draggable({
	handle: '#startselectbuttonhandle'
});
$('#dpadlrbuttonholder').draggable({
	handle: '#lrbuttonhandle'
});
$('#quickreloadvc').draggable({
	handle: '#quickreloadvcbuttonhandle'
});
$('#sendsavetoservervc').draggable({
	handle: '#sendsavetoservervcbuttonhandle'
});
$('#savestatevc').draggable({
	handle: '#savestatevcbuttonhandle'
});
$('#loadstatevc').draggable({
	handle: '#loadstatevcbuttonhandle'
});
emulator.SetPixelated(true);

setDpadEvents([
	dpad_right,
	dpad_left,
	dpad_up,
	dpad_down,
	dpad_a_button,
	dpad_b_button,
	dpad_l_button,
	dpad_r_button,
	dpad_start_button,
	dpad_select_button
]);

function handleOrientationChange(orient, initial = false) {
	const initialOrientation = islandscape;

	if (isMobile) {
		if (orient == '0') {
			islandscape = false;
			$('#dpadholder').removeClass('clear');
			$('#dpadholder').addClass('dark');

			removeClearButtonClass([
				"dpadlrbuttonholder div:not('#lrbuttonhandle')",
				"dpadstartselectbuttonholder div:not('#startselectbuttonhandle')",
				"dpadabbuttonholder div:not('#abbuttonhandle')",
				"sendsavetoservervc div:not('#sendsavetoservervcbuttonhandle')",
				"quickreloadvc div:not('#quickreloadvcbuttonhandle')",
				"savestatevc div:not('#savestatevcbuttonhandle')",
				"loadstatevc div:not('#loadstatevcbuttonhandle')"
			]);

			$('#sidebar').removeAttr('style');
			$('#menunav').removeAttr('style');
			$('#menu-btn').removeAttr('style');
			$('.nav-container').removeAttr('style');
			$('#screenwrapper').removeAttr('style');
			actioncontrolorient = true;
			orientActionControlPanel();
			setTimeout(() => {
				var newtop =
					parseInt($('#screenwrapper').css('top'), 10) +
					parseInt($('#screenwrapper').css('height'), 10) +
					(isMobile ? 0 : 5) +
					'px';
				$('#actioncontrolpanel').css({
					top: newtop,
					left: $('#screenwrapper').css('left')
				});
			}, '50');
		} else {
			islandscape = true;
			$('#dpadholder').removeClass('dark');
			$('#dpadholder').addClass('clear');

			addClearButtonClass([
				"dpadlrbuttonholder div:not('#lrbuttonhandle')",
				"dpadstartselectbuttonholder div:not('#startselectbuttonhandle')",
				"dpadabbuttonholder div:not('#abbuttonhandle')",
				"sendsavetoservervc div:not('#sendsavetoservervcbuttonhandle')",
				"quickreloadvc div:not('#quickreloadvcbuttonhandle')",
				"savestatevc div:not('#savestatevcbuttonhandle')",
				"loadstatevc div:not('#loadstatevcbuttonhandle')"
			]);

			$('#sidebar').css('right', '-350px');
			$('#menunav').css('bottom', '25px');
			$('#menu-btn').css({
				'margin-left': 'auto',
				'margin-right': '-62px'
			});
			$('.nav-container').css('margin-left', 'calc(100% - 6rem)');
			actioncontrolorient = false;
			orientActionControlPanel();
			$('#screenwrapper').css({
				left:
					parseInt($('#actioncontrolpanel').css('left'), 10) +
					parseInt($('#actioncontrolpanel').css('width'), 10) +
					'px',
				margin: 'inherit'
			});
		}

		const hasOrientationChanged = initialOrientation !== islandscape;
		const shouldToggleClearDismiss = !hasOrientationChanged && isMobile;

		if (
			$('#sidenavcleardismiss').is(':visible') ||
			(initial && islandscape)
		) {
			handleMenuButtonClick(islandscape, shouldToggleClearDismiss);
		}
	}
}

$(window).on('orientationchange', function (event) {
	handleOrientationChange(window.orientation);
});

//easy sidebar menu close on mobile
menu_btn.addEventListener('click', () => {
	handleMenuButtonClick(islandscape, isMobile);
});

function handleMenuButtonClick(isLandscape, isMobile) {
	if (islandscape) {
		sidebar.classList.remove('active-nav');
		container.classList.remove('active-cont');
		sidebar.classList.toggle('active-nav-landscape');
		container.classList.toggle('active-cont-landscape');
	} else {
		sidebar.classList.remove('active-nav-landscape');
		container.classList.remove('active-cont-landscape');
		sidebar.classList.toggle('active-nav');
		container.classList.toggle('active-cont');
	}
	if (isMobile) {
		$('#sidenavcleardismiss').toggle('active');
	}
}

$('#sidenavcleardismiss').click(function (e) {
	e.preventDefault();
	var ev = new Event('click');
	menu_btn.dispatchEvent(ev);
});

function loadAndRunLocalRom(romloc, saveloc) {
	if (saveloc != null && saveloc != '') {
		loadSaveFromServer(saveloc);
	}
	loadRomFromServer(romloc);
}

function run(file, fromServer = false) {
	let loader = document.getElementById('loader');
	loader.value = '';
	if (!fromServer) {
		$('#collapseOne').collapse('show');
		$('#collapseThree').collapse('hide');
	}

	emulator.Run(file, function (result) {
		if (result) {
			// set initial volume
			setVolume(
				$('#soundSwitchCheckChecked').is(':checked')
					? $('#volume_slider').val()
					: 0
			);
			// enable control panel and menu nodes
			$('#actioncontrolpanel').fadeIn();
			handleOrientationChange(window.orientation);
			if (!islandscape) {
				var newtop =
					parseInt($('#screenwrapper').css('top'), 10) +
					parseInt($('#screenwrapper').css('height'), 10) +
					(isMobile ? 0 : 5) +
					'px';
				$('#actioncontrolpanel').css({
					top: newtop,
					left: $('#screenwrapper').css('left')
				});
			}
			enableRunMenuNode();
			disablePreMenuNode();
			processEmulatorCheats();

			initialLoad = false;
			if (file && file.name) {
				localStorage.setItem('current-loaded-rom-filename', file.name);
			}
		}
	});
}

function runCredentialsWrapper(file) {
	if (checkAccessTok()) {
		$('#uploadRomToServerModal').modal('show');
	} else {
		run(file);
	}
}

function reset() {
	let hasCrashed = emulator.Reset();
	if (!hasCrashed) {
		setTimeout(() => {
			emulator.LCDFade();
		}, 50);
	}

	$('#actioncontrolpanel').fadeOut();
	statepause = 'stop';
	buttonPlayPress(true);
	disableRunMenuNode();
	enablePreMenuNode();
	if (!isMobile) {
		enableVirtualControls();
	}
	$('#collapseTwo').collapse('show');
}

function uploadSavedataPending(file) {
	if (file && file.name) {
		localStorage.setItem('current-loaded-save-filename', file.name);
	}

	emulator.LoadSave(file);
}

function uploadSavedataPendingCredentialsWrapper(file) {
	if (checkAccessTok()) {
		$('#uploadSaveToServerModal').modal('show');
	} else {
		uploadSavedataPending(file);
	}
}

function togglePause() {
	if (emulator.GetPaused()) {
		emulator.Resume();
	} else {
		emulator.Pause();
	}
}

function setVolume(value) {
	value = Math.pow(2, value) - 1;
	emulator.SetVolume(value);
}

function setFastForward(which) {
	let value = which ? 0 : 16;
	emulator.SetFastForward(0, value);
}

function enableDebug() {
	emulator.EnableDebug();
}

function enableRunMenuNode() {
	enableMenuNodesById(['ingameactionsmenu']);
}

function disableRunMenuNode() {
	$('#collapseOne').collapse('hide');

	disableMenuNodesById(['ingameactionsmenu']);
}

function disablePreMenuNode() {
	$('#collapseTwo').collapse('hide');

	disableMenuNodesById(['pregameactionsmenu']);
}

function enablePreMenuNode() {
	enableMenuNodesById(['pregameactionsmenu']);
}

function disableVirtualControlsMenuNode() {
	disableMenuNodesById(['virtualcontrolsmenu']);
}

function enableDpad() {
	$('#dpadholder').fadeIn();
}

function disableDpad() {
	$('#dpadholder').fadeOut();
}

function enableDpadButtons() {
	$('#dpadabbuttonholder').fadeIn();
	$('#dpadstartselectbuttonholder').fadeIn();
	$('#dpadlrbuttonholder').fadeIn();
}

function disableDpadButtons() {
	$('#dpadabbuttonholder').fadeOut();
	$('#dpadstartselectbuttonholder').fadeOut();
	$('#dpadlrbuttonholder').fadeOut();
}

function enableLogoutRomSaveQuickServerMenuNodes() {
	enableMenuNodesById([
		'serverlogout',
		'loadserverrom',
		'loadserversave',
		'sendsavetoserver',
		'quickreloadserver'
	]);
	enableLoggedInVirtualControls();
}

function offlineEnableRomSaveServerMenuNodes() {
	enableMenuNodesById([
		'loadserverrom',
		'loadserversave',
		'quickreloadserver'
	]);
	enableLoggedInVirtualControls();
}

function disableLogoutRomSaveServerMenuNodes() {
	disableMenuNodesById([
		'serverlogout',
		'loadserverrom',
		'loadserversave',
		'sendsavetoserver',
		'quickreloadserver'
	]);
	disableLoggedInVirtualControls();
}

function enableMenuNodesById(nodes) {
	nodes.forEach(function (elem) {
		$('#' + elem).removeClass('disabled');
		$('#' + elem).addClass('enabled');
	});
}

function disableMenuNodesById(nodes) {
	nodes.forEach(function (elem) {
		$('#' + elem).removeClass('enabled');
		$('#' + elem).addClass('disabled');
	});
}

function enableLoggedInVirtualControls() {
	$('#sendSaveToServerVCConf td:first-child').removeClass('text-muted');
	$('#sendSaveToServerVCConf td input').prop('disabled', false);
}

function disableLoggedInVirtualControls() {
	$('#sendSaveToServerVCConf td:first-child').addClass('text-muted');
	$('#sendSaveToServerVCConf td input').prop('disabled', true);
}

function addClearButtonClass(nodes) {
	nodes.forEach(function (elem) {
		$('#' + elem).addClass('clearbutton');
	});
}

function removeClearButtonClass(nodes) {
	nodes.forEach(function (elem) {
		$('#' + elem).removeClass('clearbutton');
	});
}

function enableVirtualControls() {
	if (virtualControlsEnabled) {
		disableDpad();
		disableDpadButtons();
		hideExtraControls();
		virtualControlsEnabled = false;
	} else {
		enableDpad();
		enableDpadButtons();
		processExtraControlsConf();
		virtualControlsEnabled = true;
	}
}

document.addEventListener(
	'webkitfullscreenchange',
	function () {
		let canvas = document.getElementById('screen');
		if (document.webkitIsFullScreen) {
			canvas.setAttribute('style', 'margin: 0;top: 50%;');
		} else {
			canvas.removeAttribute('style');
		}
	},
	false
);

const fullScreen = () => {
	var elem = document.getElementById('screen');
	if (undefined === elem.requestFullscreen) {
		//noinspection JSUnresolvedVariable
		elem.requestFullscreen =
			elem.webkitRequestFullscreen ||
			elem.webkitRequestFullScreen ||
			elem.mozRequestFullScreen ||
			elem.msRequestFullscreen;
	}
	elem.requestFullscreen();
};

//set dpad/button event listeners
function setDpadEvents(elems) {
	var isKeyDown = {};
	var pointerCount = 0;

	elems.forEach(function (elem, index) {
		var keyId = $(elem).attr('data-keyid').toLowerCase();

		elem.addEventListener('pointerdown', (e) => {
			pointerCount += 1;
			isKeyDown[keyId] = true;
			emulator.SimulateKeyDown(keyId);
			elem.releasePointerCapture(e.pointerId); // <- Important!
		});

		elem.addEventListener('pointerup', (e) => {
			if (pointerCount > 0) {
				pointerCount -= 1;
			}
			isKeyDown[keyId] = false;
			emulator.SimulateKeyUp(keyId);
		});

		elem.addEventListener('pointerenter', (e) => {
			if (pointerCount > 0) {
				isKeyDown[keyId] = true;
				emulator.SimulateKeyDown(keyId);
				elem.releasePointerCapture(e.pointerId); // <- Important!
			}
		});

		elem.addEventListener('pointerleave', (e) => {
			if (isKeyDown[keyId]) {
				isKeyDown[keyId] = false;
				emulator.SimulateKeyUp(keyId);
				elem.releasePointerCapture(e.pointerId); // <- Important!
			}
		});

		elem.addEventListener('pointerout', (e) => {
			if (isKeyDown[keyId]) {
				isKeyDown[keyId] = false;
				emulator.SimulateKeyUp(keyId);
				elem.releasePointerCapture(e.pointerId); // <- Important!
			}
		});

		elem.addEventListener('pointercancel', (e) => {
			if (pointerCount > 0) {
				pointerCount -= 1;
			}
			isKeyDown[keyId] = false;
			emulator.SimulateKeyUp(keyId);
			elem.releasePointerCapture(e.pointerId);
		});
	});
}

function buttonPlayPress(isReset) {
	//isreset here means is from automatic reset/resume
	if (statepause == 'stop') {
		statepause = 'play';
		$('#button_play i').attr('class', 'fa fa-pause');
	} else if (statepause == 'play' || statepause == 'resume') {
		statepause = 'pause';
		$('#button_play i').attr('class', 'fa fa-play');
	} else if (statepause == 'pause') {
		statepause = 'resume';
		$('#button_play i').attr('class', 'fa fa-pause');
	}
	if (!isReset) {
		togglePause();
	}
}

function buttonFastforwardPress() {
	stateff = !stateff;
	var button = $('#button_ffw i');
	if (stateff) {
		button.attr('class', 'fa fa-forward');
	} else {
		button.attr('class', 'fa fa-fast-forward');
	}
	setFastForward(stateff);
}

function orientActionControlPanel() {
	if (!actioncontrolorient) {
		$('#actioncontrolpanel').css('width', '175px');
		$('#button_rotate label').text('Rot.');
		$('#pixelated_check_lbl').text('Pix.');
		if (islandscape) {
			$('#actioncontrolpanel').css({ top: '0px', left: '0px' });
		}
		actioncontrolorient = true;
	} else {
		$('#actioncontrolpanel').css('width', 'fit-content');
		$('#button_rotate label').text('Rotate');
		$('#pixelated_check_lbl').text('Pixelate');
		actioncontrolorient = false;
	}
}

function fillUserKeyBinding(event, cell) {
	cell.textContent = event.key;
	$(cell).attr('data-keycode', event.keyCode);
}

function processEmulatorDefaultKeyBindings() {
	const keyBindings = emulator.DefaultKeyBindings();

	keyBindings.forEach(function ({ descrip, keybind }) {
		keyBindingElem = `
			<tr>
				<td class="descrip">${descrip}</td>
				<td
					contenteditable
					class="keybind"
					onkeyup="fillUserKeyBinding(event,this);"
				>
					${keybind}
				</td>
			</tr>
		`;

		$(keyBindingElem).appendTo('#controlsTable');
	});
}

function remapUserKeyBindings() {
	$('#controlsTable tr').each(function () {
		var descrip = $.trim($(this).find('.descrip').text()),
			keybinding_code = $.trim(
				$(this).find('.keybind').attr('data-keycode')
			),
			keybinding_name = $.trim($(this).find('.keybind').text());

		if (
			descrip != null &&
			descrip != '' &&
			keybinding_code != null &&
			keybinding_code != '' &&
			keybinding_name != null
		) {
			emulator.RemapKeyBinding(descrip, keybinding_code, keybinding_name);
		}
	});
}

function sendCurrentSaveToServer() {
	var save = emulator.GetCurrentSave();
	if (!save) {
		alert('No save data available to send');
		return;
	}
	var blob = new Blob([save], { type: 'data:application/x-spss-sav' });
	const current_loaded_save_filename = localStorage.getItem(
		'current-loaded-save-filename'
	);
	const backup_initial_filename = localStorage
		.getItem('current-loaded-rom-filename')
		.replace('.gba', '.sav');

	var file = new File(
		[blob],
		current_loaded_save_filename || backup_initial_filename
	);
	var container = new DataTransfer();
	container.items.add(file);
	$('#saveloader')[0].files = container.files; //onchange event should be triggered here

	//if (!isMobile) { //temporarily turning off check, issues with latest safari
	console.log('browser firing onchange event manually');
	var ev = new Event('change');
	document.getElementById('saveloader').dispatchEvent(ev);
	//}
}

function loadSaveState(slot) {
	emulator.LoadSaveState(slot);
	localStorage.setItem('current-save-state-slot', slot);
}

function createSaveState(slot) {
	emulator.CreateSaveState(slot);
	localStorage.setItem('current-save-state-slot', slot);
}

function loadCurrentSaveState() {
	let slot = localStorage.getItem('current-save-state-slot');
	emulator.LoadSaveState(slot);
}

function createCurrentSaveState() {
	let slot = localStorage.getItem('current-save-state-slot');
	emulator.CreateSaveState(slot);
}

function listSaveStates() {
	let saveStates = emulator.ListSaveStates();

	saveStates = saveStates.filter((e) => e !== '.' && e !== '..');

	$('#saveStateList').empty();

	if (saveStates.length) {
		saveStates.forEach(function (saveStateName, index) {
			$('<li>' + saveStateName + '</li>').appendTo('#saveStateList');
		});

		$('#saveStateList').parent().show();
	}
}

function quickReloadCredentialsWrapper(file) {
	if (checkAccessTok()) {
		$('#quickReloadServerModal').modal('show');
	} else {
		alert('Please log in to use this feature');
	}
}

function quickReload() {
	var localReloadSuccessful = emulator.QuickReload(); // attempts local game+sav reload
	if (!localReloadSuccessful) {
		quickReloadServer();
	} else {
		setVolume(
			$('#soundSwitchCheckChecked').is(':checked')
				? $('#volume_slider').val()
				: 0
		);
		$('#actioncontrolpanel').fadeIn();
		handleOrientationChange(window.orientation);
		enableRunMenuNode();
		disablePreMenuNode();
	}
}

function quickReloadServer() {
	if (!checkAccessTok()) return;

	const current_loaded_save_filename = localStorage.getItem(
		'current-loaded-save-filename'
	);
	const current_loaded_rom_filename = localStorage.getItem(
		'current-loaded-rom-filename'
	);

	if (
		current_loaded_save_filename === '' ||
		current_loaded_rom_filename === '' ||
		current_loaded_save_filename === null ||
		current_loaded_rom_filename === null
	) {
		alert('No current server save/rom filenames');
		return;
	}
	//reset emulator if active
	if (emulator.IsRunning()) {
		emulator.Reset();
		emulator.LCDFade();
	}

	//reload current in use save
	query_select_save = current_loaded_save_filename;
	loadSaveFromServer(query_select_save);

	//reload current in use rom
	query_select_rom = current_loaded_rom_filename;
	loadRomFromServer(query_select_rom);
}

function newCheatsRow(description = '', code = '', isCheatActive = false) {
	cheatRowElem = `
		<tr class="cheatsRow">
			<td 
				contenteditable
				class="descrip"
				placeholder="Name"
			>${description}</td>
			<td
				contenteditable
				class="cheatCode"
				placeholder="820XXXXX 1234"
			>${code}</td>
			<td class="isCheatActive">
				<input
					type="checkbox"
					${isCheatActive ? 'checked' : ''}
				/>
			</td>
		</tr>
	`;

	$(cheatRowElem).appendTo('#cheatsTable');
}

function processEmulatorCheats() {
	const cheatsFile = emulator.GetCurrentCheatsFile();
	if (!cheatsFile) {
		return;
	}

	const enc = new TextDecoder('utf-8');
	const cheatsContent = enc.decode(cheatsFile);
	// set raw editor value
	$('#rawCheats').val(cheatsContent);

	// parse cheats file, only libretro format supported at this time
	const parsedCheats = emulator.ParseCheatsString(cheatsContent);
	if (!parsedCheats) {
		// must view in raw format, not in libretro file format
		$('#rawCheatsTabHeader').tab('show');
		return;
	}

	// clear previous UI rows
	$('#cheatsTable .cheatsRow').remove();

	// sync UI with uploaded cheats file
	for (const idx in parsedCheats) {
		const cheat = parsedCheats[idx];
		newCheatsRow(
			cheat['desc'],
			cheat['code'],
			cheat['enable'] === 'true' ? true : false
		);
	}
}

function saveCheatsToFile() {
	var libretroCheatsFile = null;

	if ($('#rawCheatsTab').hasClass('active')) {
		libretroCheatsFile = $('#rawCheats').val();
	} else {
		const libretroCheats = $('#cheatsTable tr')
			.map(function (idx, cheatRow) {
				if (idx === 0) return null;

				const descrip = $(this).find('.descrip').text().trim();
				const cheatCode = $(this).find('.cheatCode').text().trim();
				const isEnabled = $(this)
					.find('.isCheatActive input')
					.is(':checked');

				if (
					!descrip ||
					descrip === '' ||
					!cheatCode ||
					cheatCode === ''
				) {
					return null;
				}

				// write cheats in libretro format
				return `cheat${
					idx - 1
				}_desc = "${descrip}"\ncheat${idx - 1}_enable = ${isEnabled}\ncheat${idx - 1}_code = "${cheatCode}"\n`;
			})
			.toArray();

		if (libretroCheats?.length) {
			libretroCheatsFile =
				`cheats = ${libretroCheats?.length}\n\n` +
				libretroCheats.join('\n');
		}
	}

	if (libretroCheatsFile) {
		var blob = new Blob([libretroCheatsFile], { type: 'text/plain' });
		var file = new File([blob], emulator.GetCurrentCheatsFileName());

		emulator.LoadCheatsFile(file);
	}
}

function saveExtraControlsConf() {
	const extraControls = [
		'flexCheckQuickReloadVC',
		'flexCheckSendSaveToServerVC',
		'flexCheckSaveStateVC',
		'flexCheckLoadStateVC'
	];

	for (extraControl of extraControls) {
		checkVal = $('#' + extraControl).is(':checked');
		if (checkVal) {
			localStorage.setItem(extraControl, JSON.stringify(checkVal));
		} else {
			localStorage.removeItem(extraControl);
		}
		if (virtualControlsEnabled) {
			toggleExtraControl(extraControl, checkVal);
		}
	}
}

function processExtraControlsConf(shouldToggle = true) {
	const extraControls = [
		'flexCheckQuickReloadVC',
		'flexCheckSendSaveToServerVC',
		'flexCheckSaveStateVC',
		'flexCheckLoadStateVC'
	];

	for (extraControl of extraControls) {
		savedControl = localStorage.getItem(extraControl);
		if (savedControl) {
			$('#' + extraControl).prop('checked', true);
			if (shouldToggle) {
				toggleExtraControl(extraControl, true);
			}
		}
	}
}

function hideExtraControls() {
	const extraControls = [
		'flexCheckQuickReloadVC',
		'flexCheckSendSaveToServerVC',
		'flexCheckSaveStateVC',
		'flexCheckLoadStateVC'
	];

	for (extraControl of extraControls) {
		toggleExtraControl(extraControl, false);
	}
}

function toggleExtraControl(extraControl, toggle) {
	extraControlSelector = extraControl.replace('flexCheck', '').toLowerCase();
	if (toggle) {
		$('#' + extraControlSelector).fadeIn();
	} else {
		$('#' + extraControlSelector).fadeOut();
	}
}

function saveCoreChoiceConf() {
	const coreChoices = ['flexCheckmGBACore', 'flexCheckgbaJSCore'];

	for (coreChoice of coreChoices) {
		checkVal = $('#' + coreChoice).is(':checked');
		if (checkVal) {
			localStorage.setItem(coreChoice, JSON.stringify(checkVal));
		} else {
			localStorage.removeItem(coreChoice);
		}
	}

	// the two emulators use different canvas contexts
	// reloading the page to instanciate the new emulator
	if (!emulator.IsRunning()) {
		location.reload();
	}

	return true;
}

// reads configuration, returns appropriate emulator,
// mgba being the default.
// Supported Emulator Types: ['mGBA','gbajs']
function processCoreChoiceConf() {
	var emulator = null;
	const coreChoices = ['flexCheckmGBACore', 'flexCheckgbaJSCore'];

	for (coreChoice of coreChoices) {
		savedChoice = localStorage.getItem(coreChoice);
		if (savedChoice) {
			$('#' + coreChoice).prop('checked', true);
			//instanciate emulator
			emulatorType = $('#' + coreChoice).val();
			emulator = new GameBoyAdvanceEmulator(emulatorType);
		}
	}

	if (emulator == null) {
		//mgba default
		emulator = new GameBoyAdvanceEmulator('mGBA');
	}

	return emulator;
}
