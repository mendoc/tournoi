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
                if (value === "0") return;
                write(`/tournoi/duel/players/${playerKey}`, { id: value })
            });
        }
    }
}