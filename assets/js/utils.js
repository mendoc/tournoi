/* Les fonctions */

function cons(stuff) {
    console.log(stuff)
}

function listen(path, callback) {
    firebase.database().ref(path).on('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function write(path, value) {
    firebase.database().ref(path).set(value);
}

function push(path, value) {
    firebase.database().ref(path).push(value);
}

function getKey() {
    return firebase.database().ref().push().key;
}

function cacher(selector) {
    $(selector).css("display", "none");
}

function afficherFenetre(name) {
    $(".fenetre").css("display", "none");
    $("#fen-" + name).css("display", "block");
}
function getFenetre() {
    let parts = location.href.split("?")
    if (parts.length > 1) {
        return parts[1].replace("fen=", "");
    }
    return "splash";
}

function loadFenetre(fen) {
    switch (fen) {
        case "players": {
            listen("/tournoi/players", function (data) {
                if (data) {
                    $('#fen-players tbody').empty();
                    $.each(data, function (index, player) {
                        $('#fen-players tbody').append(`<tr><td>${index}</td><td>${player.name}</td></tr>`);
                    });
                    $('#fen-players [name="name"]').val("");
                    $('#fen-players [name="id"]').val("");
                }
            });

            $('#fen-players [type="submit"]').click(function () {
                let playerName = $('#fen-players [name="name"]').val();
                let playerID = $('#fen-players [name="id"]').val();
                if (!playerID) return;
                let player = null;
                if (playerName) {
                    player = {
                        name: playerName
                    }
                }
                write(`/tournoi/players/${playerID}`, player)
            });
        }
        break;
        case "choice": {
            let playerKey = getKey();
            listen("/tournoi/players", function (data) {
                if (data) {
                    $.each(data, function (index, player) {
                        $('#fen-choice select').append(`<option value="${index}">${player.name}</option>`);
                    });
                }
            });

            $('#fen-choice select').change(function () {
                let value = $(this).val();
                let name = $('#fen-choice select option:selected').text();
                if (value === "0") return;
                write(`/tournoi/duel/players/${playerKey}`, { id: value, name: name })
            });
        }
        break;
        case "config": {
            listen("/tournoi/config", function (config) {
                if (config) {
                    $('#fen-config [name="questions"]').val(config.source);
                    $('#fen-config [name="feuille"]').val(config.sheet);
                    $('#fen-config [name="temps"]').val(config.temps);
                    $('#fen-config [name="quest-duel"]').val(config.quest_duel);
                }
            });

            $('#fen-config [type="submit"]').click(function () {
                let source = $('#fen-config [name="questions"]').val();
                let sheet = $('#fen-config [name="feuille"]').val();
                let temps = $('#fen-config [name="temps"]').val();
                let quest_duel = $('#fen-config [name="quest-duel"]').val();
                if (!source) return;
                let config = {
                    source: source,
                    sheet: sheet,
                    temps: temps,
                    quest_duel: quest_duel
                }
                write('/tournoi/config/', config)
            });

            $('#fen-config [type="button"]').click(function () {
                location.href = "?fen=classement"
            });
        }
        break;
        case "classement": {
            listen("/tournoi/duel/players", function (players) {
                if (players) {
                    let n = 1;
                    $('#fen-classement table tr:first').empty();
                    $.each(players, function (index, player) {
                        if (n > 4) return;
                        cons(index)
                        $('#fen-classement table tr:first').append(`<td>${player.name}</td>`);
                        n++;
                    });
                }
            });
        }
    }
}