const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DataInfoSchema = new Schema ({
    scrape_id: {
        type: Schema.ObjectId,
        index: true,
    },
    scrape_dt: {
        type: Date,
        required: true,
    },
    mark: String,
    cpu: String,
    ram: Number,
    rom: Number,
});

mongoose.model('DataInfo', DataInfoSchema);

