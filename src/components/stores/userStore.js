import { observable, action } from "mobx";
import axios from 'axios';

export class userStore {
    @observable user = {
        id: Number,
        login: false,
        name: String,
        email: '',
        password: '',
        phone: '',
        radius: Number,
        ranking: Number,
        counter: Number,
        skills: [],
        lat: Number,
        lon: Number,
    }

    @action getSkills = async () => {
        let userId = this.user.id
        let skills = await axios.post(`http://localhost:8080/profile`, userId)
        this.user.skills = skills.data.map(s => s.skill)
    }

    @action addNewUser = async (obj) => {
        console.log(obj);
        let newUser = {
            name: obj.name,
            email: obj.email,
            password: obj.password,
            phone: obj.phone,
            radius: 0,
            ranking: 0,
            counter: 0,
        }
        let id = await axios.post('http://localhost:8080/signup', newUser)
        console.log(id.data[0])
        console.log(newUser);
        this.user = {
            id: id.data[0],
            login: true,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            phone: newUser.phone,
            radius: newUser.radius,
            ranking: newUser.ranking,
            counter: newUser.counter,
        }
    }

    @action login = async (email, password) => {
        let user = await axios.post('http://localhost:8080/login', {
            auth: {
                email: email,
                password: password
            }
        })
        console.log(user.data[0])
        user = user.data[0]
        if (user) {
            this.user = {
                id: user.id,
                login: true,
                name: user.name,
                email: user.email,
                password: user.password,
                phone: user.phone,
                radius: user.radius,
                ranking: user.ranking,
                counter: user.counter,
                lat: 0,
                lon: 0,
            }
        } else {
            alert('Please enter a valid email and password')
        }
        this.getSkills();
        this.getLocation();
    }

    @action logout = () => {
        this.user = {
            id: Number,
            login: false,
            name: String,
            email: '',
            password: '',
            phone: '',
            radius: Number,
            ranking: Number,
            counter: Number,
            lat: Number,
            lon: Number,
        }
    }
    // componentDidMount() {
    //     this.getLocation()
    // }

    getLocation = () => {
        if (navigator.geolocation) {
            console.log('true');
            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }

    showPosition = async (position) => {
        console.log("Latitude: " + position.coords.latitude +
            " Longitude: " + position.coords.longitude);
        this.user.lon = position.coords.longitude
        this.user.lat = position.coords.latitude
        let result = await this.getDistanceFromLatLonInKm(this.user.lat, this.user.lon, this.user.lat + 0.03, this.user.lat + 0.03)
        // console.log(result.toFixed(2) + ' km');
        // this.user.radius = result.toFixed(2)
        // return result.toFixed(2) + ' km'
    }

    getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d.toFixed(2) + ' km';
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

}