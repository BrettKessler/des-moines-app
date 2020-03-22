require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path')
const upload = require('./services/s3-service');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const Image = require('./backend/models/images');
const ApprovedImage = require('./backend/models/approved-image');
const Supply = require('./backend/models/supply');
const email = require('./services/email-service');
const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;
const accountSid = process.env.ACCOUNT_SID_TWILLIO;
const authToken = process.env.AUTH_TOKEN_TWILLIO;
const client = require('twilio')(accountSid, authToken);

mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to Grimes database!')
})
.catch((error) => {
  console.log(error);
  console.log('Connection Failed!')
})

app.use('/uploads', express.static('uploads'))

app.use(express.static(__dirname + '/dist/fortune'));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS');
    next();
    });

/* Where image is the name of the property sent from angular via the Form Data and the 1 is the max number of files to upload*/
app.post('/upload', upload.array('image', 1), (req, res) => {
    /* This will be th 8e response sent from the backend to the frontend */
    res.send({ image: req.file });
});

app.get('/images', (req, res) => {
    Image.find().then(data => {
        if(data) {
            return res.status(200).json({
                data: data
            })
        }
    })
})

app.post('/user-upload-image', upload.single('image') , (req, res) => {
    const tpImage = new Image({
        tpImage: req.file.path
    })
    tpImage.save().then(result => {
        return res.status(200).json({
            message:'Image Successfully saved',
            data: result
        })
    })
})

app.use ( bodyParser.json( { type: '*/*' }));

app.get('/approved-image', (req, res) => {
    ApprovedImage.find().then(result => {
        return res.status(200).json({
            message:'Image Successfully saved',
            data: result
        })
    })
})

function sendSMS(data, list) {
    let supplyList = ``;
    list.forEach(item => {
        supplyList = supplyList + ` ${item.name}, `;
    })

    client.messages
    .create({
        body: `Des Moines App 
        name: ${data.name} 
        email: ${data.email} 
        address1: ${data.address1} 
        phone number: ${data.phoneNumber} 
        supply description: ${data.supplyDescription} 
        supply list: ${supplyList}
        `,
        from: process.env.PHONE_NUMBER,
        to: process.env.MY_PHONE_NUMBER
    })
    .then(message => console.log(message.sid));
}

app.route('/submit-supplies').post((req, res) => {
    const supply = new Supply({
        name: req.body.personalInfo.name,
        email: req.body.personalInfo.email,
        address1: req.body.personalInfo.address1,
        address2: req.body.personalInfo.address2,
        phoneNumber: req.body.personalInfo.phoneNumber,
        zipCode: req.body.personalInfo.zipCode,
        supplyDescription: req.body.personalInfo.supplyDescription,
        paymentType: req.body.personalInfo.paymentType[0],
        dateSubmitted: moment().format('lll'),
        ipAddess: req.ip,
        supplyList: req.body.supplyList
    })
    supply.save();
    sendSMS(req.body.personalInfo, req.body.supplyList);
    email.sendSupplyEmail(req.body.personalInfo);
    res.status(201).json({
        message: 'Hello'
    });
})

app.route('/pickup-supplies').post((req, res) => {
    const id = req.body.pickupInfo._id;

    if(req.body.pickupInfo.supplyList === []) {
        return res.status(200).json({
            error: 'nothing selected'
        });
    }

    const pickingUpSupplyList = []
    const oldSupplyList = []

    req.body.pickupInfo.supplyList.forEach(supplies => {
        if(supplies.pickedUp) {
            pickingUpSupplyList.push(supplies);
        }
        if(!supplies.pickedUp) {
            oldSupplyList.push(supplies);
        }
    })

    Supply.update({_id: ObjectId(id)}, {$set: {supplyList: oldSupplyList}}).then(data => {
        console.log(data);
    });

    if(oldSupplyList.length === 0){
        deleteSupplyList(req.body.id);
    }

    email.sendSupplyList(req.body, pickingUpSupplyList);
    return res.status(200).json({
        message: 'Added items to list'
    });
})

function deleteSupplyList(id) {
    Supply.findOneAndDelete({ '_id': ObjectId(id) }).then((data) => {
        return;
    })
}

app.get('/get-supplies', (req, res) => {
    Supply.find().then((data) => {
        return res.status(200).json({
            data: data
        })
    })
})

app.post(('/submit-contact'), (req, res) => {
    const contactData = req.body;
    email.sendContactUs(contactData);
})

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/fortune/index.html'));
});

app.listen(port, () => {
  console.log(`Started Fortune ${port}`);
})

