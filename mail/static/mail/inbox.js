document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Sending emails
  document.querySelector("#compose-form").addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

//show email
function showEmail(id){

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#emails-details').style.display = 'block';

    document.querySelector("#emails-details").innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong> ${email.sender}</li>
        <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
    `
    if (!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })

    }

    const arch_button = document.createElement('button');
    arch_button.innerHTML = email.archived ? "Unarchive": "Archive";
    arch_button.className = email.archived ? "btn btn-success": "btn btn-danger"
    arch_button.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
      .then( () => { load_mailbox('archive')})
    });
    document.querySelector('#emails-details').append(arch_button);

    const reply_button = document.createElement('button');
    reply_button.innerHTML = "Reply";
    reply_button.className =  "btn btn-info";
    reply_button.addEventListener('click', function() {
      compose_email();

      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if (subject.slice(0, 3) != "Re:"){
        subject = "Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

    });
    document.querySelector('#emails-details').append(reply_button);


  });
 }
 

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  displayMailBox(mailbox);

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    emails.forEach(eachEmail => {

      console.log(eachEmail)

      const newMail = document.createElement('div');
      newMail.className = "list-group-item";
      newMail.innerHTML = `
      <h6>Sender: ${eachEmail.sender}</h6>
      <h6>Subject: ${eachEmail.subject}</h6>
      <p>${eachEmail.timestamp}</p>
      `;

      newMail.className = eachEmail.read ? "read": "unread";

      newMail.addEventListener('click', function(){
        showEmail(eachEmail.id)
    });
      document.querySelector('#emails-view').append(newMail);
    })
  
  });

}

function displayMailBox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function send_mail(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value ;
  const subject =  document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}

// Display mailbox


//fetch data

