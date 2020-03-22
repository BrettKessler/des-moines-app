const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendContactUs(data) {
    if(data) {
    const output = `
    <h1>${data.name} is reaching out from ${data.email}</h1>
    <h3>They Said:</h3>
    <p>${data.content}</p>
  `
    const msg = {
        to: process.env.CONTACT_US_EMAIL,
        from: 'Des Moines App <no-reply@des-moines-app.com>',
        subject: 'Contact Us',
        text: 'Contact us',
        html: output,
      };
      
      sgMail.send(msg);

    console.log('Contact us Email Sent');

    }
}

async function updateUser(data, list) {
    let shoppingList = ``;
    if(data) {
        list.forEach(item => {
            shoppingList = shoppingList + `<li>${item.name}</li>`;
        })
        const output = `
        <h1>Hi ${data.pickupInfo.name}, ${data.pickupList.pickupName} has agreed to get your supplies</h1>
        <h3>Below you can find their contact information in case you need to get ahold of them.</h3>
        <p>Name: ${data.pickupList.pickupName}</p>
        <p>Email: ${data.pickupList.pickupEmail}</p>
        <p>Phone Number: ${data.pickupList.pickupPhoneNumber}</p>
        <h3>Things they are picking up for you:</h3>
        <ul class="list">
        ${shoppingList}
        </ul>
        <p>Your list will stay on the site until all the items are gone.</p>
    `
        const msg = {
            to: `${data.pickupInfo.email}`,
            from: 'Des Moines App <no-reply@des-moines-app.com>',
            subject: 'Someone Is Getting Your Supplies!',
            text: 'Someone is getting your supplies',
            html: output,
        };
        
        sgMail.send(msg);

        console.log('Updated User Email Sent');
    }
}

async function sendSupplyEmail(data) {
    if(data) {
    const output = `
    <h1>Hi ${data.name}, thanks for reaching out!</h1>
    <p>We put your list up on des-moines-app.com</p>
    <p>If someone picks up your list, we will notify you via email and also send you their contact info.</p>
  `
    const msg = {
        to: `${data.email}`,
        from: 'Des Moines App <no-reply@des-moines-app.com>',
        subject: 'Supply List Submitted',
        text: 'Supply List Submitted',
        html: output,
      };
      
      sgMail.send(msg);

        console.log('Supply Email Sent');

    }
}

async function sendSupplyList(data, list) {
    let shoppingList = ``;
    if(data) {
        list.forEach(item => {
            shoppingList = shoppingList + `<li>${item.name}</li>`;
        })

        const output = `
        <h1>Hi ${data.pickupList.pickupName}, thanks for being a good resident of Des Moines</h1>
        <h3>Below you can find the supplies ${data.pickupInfo.name} needs.</h3>
        <p>Email: ${data.pickupInfo.email}</p>
        <p>Address: ${data.pickupInfo.address1}</p>
        <p>Address 2: ${data.pickupInfo.address2}</p>
        <p>Phone Number: ${data.pickupInfo.phoneNumber}</p>
        <p>Zip Code: ${data.pickupInfo.zipCode}</p>
        <h3>They are needing</h3>
        <ul class="list">
        ${shoppingList}
        </ul>
    `
        const msg = {
            to: `${data.pickupList.pickupEmail}`,
            from: 'Des Moines App <no-reply@des-moines-app.com>',
            subject: 'Des Moines Resident Supply List',
            text: 'Des Moines Resident Supply List',
            html: output,
        };

        await updateUser(data, list);

        sgMail.send(msg);

        console.log('Sent supply list email');

        }
    }

module.exports = {
    sendContactUs,
    sendSupplyList,
    sendSupplyEmail
}