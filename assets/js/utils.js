/* Les fonctions */

function cons(stuff) {
    console.log(stuff)
}

function listen(path, callback) {
    firebase.database().ref(path).on('value', function (snapshot) {
        callback(snapshot.val());
    });
}

function once(path, callback) {
    firebase.database().ref(path).once('value', function (snapshot) {
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
            once("/tournoi/duel/players", function (players) {
                if (players) {
                    let n = 0;
                    $('#fen-classement table tr:first').empty();
                    let selects = $('#fen-classement select');
                    $.each(players, function (index, player) {
                        if (n > 3) return;
                        selects.eq(n).data("key", index);
                        selects.eq(n).data("id", player.id);
                        selects.eq(n).data("name", player.name);
                        $('#fen-classement table tr:first').append(`<td>${player.name}</td>`);
                        n++;
                    });
                }
            });

            $('#fen-classement select').change(function () {
                let player = $(this).data();
                let path = `/tournoi/duel/players/${player.key}`;
                player.team = $(this).val();
                write(path, player)
            });

            $('#fen-classement [type="button"]').click(function () {
                let selects = $('#fen-classement select');
                let ready = true;
                let control = 0;
                $.each(selects, function (index, sel) {
                    control += parseInt($(sel).val());
                    if ($(sel).val() === "0") ready = false;
                });
                if (ready && control == 6) location.href = "?fen=duel"
            });
        }
    }
}