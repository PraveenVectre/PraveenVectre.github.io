
$(document).ready(function () {
    const chatBox = document.getElementById('chatBox');
    $('#chatToggle').on('click', function () {
        $('#chatWindow').show();
        setTimeout(() => {
            $('#chatWindow').addClass('show');
        }, 10);
        $(this).hide();
    });

    $('#closeChat').on('click', function () {
        $('#chatWindow').removeClass('show');
        setTimeout(() => {
            $('#chatWindow').hide();
            $('#chatToggle').fadeIn();
        }, 300);
    });

    function sendMessage(question, parentId = null) {
        $.ajax({
            url: '/send-message',
            type: 'POST',
            data: {
                parentId: parentId,
                message: question.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ' '),
                _token: '{{ csrf_token() }}'
            },
            success: function (resdata) {
                if (resdata.status === 0) {
                    $('#chatBox').append(`<div class="chat-message chat-bot"><span class="text-secondary">${resdata.message}</span></div>`);
                }
                let first = true;
                resdata.reply.forEach(function (q) {
                    if (first && q.heading) {
                        $('#chatBox').append(`<div class="chat-message chat-bot"><h6>${q.heading}</h6></div>`);
                        first = false;
                    }
                    let content = q.url ?
                        `<a href="${q.url}" target="_blank" class="btn btn-info btn-sm">${q.question}</a>` :
                        `<button class="btn btn-info btn-sm ques_btn" data-id="${q.question_id}" value="${q.question}">${q.question}</button>`;
                    $('#chatBox').append(`<div class="chat-message chat-bot">${content}</div>`);
                });
                if (resdata.searchOnWeb && resdata.status === 0) {
                    $('#chatBox').append(`<a href="${resdata.searchOnWeb}" target="_blank" class="btn btn-success btn-sm">🔍 Search on Web</a>`);
                }
                // $('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
                // const chatBox = document.getElementById('chatBox');
                chatBox.scrollTo({
                    top: chatBox.scrollHeight,
                    behavior: 'smooth'
                });
            }
        });
    }

    $.ajax({
        url: '/load-initial-questions',
        type: 'GET',
        success: function (data) {
            data.forEach(function (q) {
                let content = q.url ?
                    `<a href="${q.url}" target="_blank" class="btn btn-info btn-sm">${q.question}</a>` :
                    `<button class="btn btn-info btn-sm ques_btn" data-id="${q.question_id}" value="${q.question}">${q.question}</button>`;
                $('#chatBox').append(`<div class="chat-message chat-bot">${content}</div>`);
            });
            // $('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
            // const chatBox = document.getElementById('chatBox');
            chatBox.scrollTo({
                top: chatBox.scrollHeight,
                behavior: 'smooth'
            });
        }
    });

    $(document).on('click', '.ques_btn', function () {
        let question = $(this).val();
        let parentId = $(this).data('id');
        $('#chatBox').append(`<div class="chat-message chat-user"><span class="btn btn-secondary btn-sm">${question}</span></div>`);
        sendMessage(question, parentId);
    });

    $('#chatForm').on('submit', function (e) {
        e.preventDefault();
        let userMsg = $('#message').val();
        $('#message').val('');
        let abuseWords = checkWords(userMsg.toLowerCase());
        // console.log("Abuse words check:", userMsg.toLowerCase());
        if (abuseWords.status === 1) {
            $('#chatBox').append(`<div class="chat-message chat-bot">${abuseWords.msg}</div>`);
        }
        else {
            $('#chatBox').append(`<div class="chat-message chat-user"><span class="btn btn-secondary btn-sm">${userMsg}</span></div>`);
            sendMessage(userMsg);
        }
        // $('#chatBox').scrollTop($('#chatBox')[0].scrollHeight);
        // const chatBox = document.getElementById('chatBox');
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    });
});

let recognition;
let recognizing = false;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
        recognizing = true;
        $('#micBtn').text('🎙️Listening...');
    };
    recognition.onend = () => {
        recognizing = false;
        $('#micBtn').html('<i class="fa-solid fa-microphone"></i>');
    };
    recognition.onresult = (event) => {
        $('#message').val(event.results[0][0].transcript).focus();
        $('#chatForm').submit();
    };
}
$('#micBtn').on('click', function () {
    if (recognition && !recognizing) recognition.start();
    else if (recognizing) recognition.stop();
});
