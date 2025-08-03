document.addEventListener('DOMContentLoaded', () => {

    // === Smooth Scrolling for Nav Links ===
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // === App State ===
    let map;
    let userMarker;
    let clinicMarkers = [];
    let currentUserPosition = { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta
    let lastOpenedPopup = null;
    // State tambahan
    let isUserLocated = false;
    let currentPage = 1;
    const clinicsPerPage = 5;
    let filteredClinicsGlobal = [];
    let geoWatchId = null;

    // === DOM Elements ===
    const findNearbyBtn = document.getElementById('find-nearby-btn');
    const clinicList = document.getElementById('clinic-list');
    const resultsInfo = document.getElementById('results-info');
    const modal = document.getElementById('clinic-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('modal-close-btn');

    // === Rich Dummy Data for Clinics ===
    const dummyClinics = [
        // Jakarta
        { 
            id: 1, name: 'Audy Dental Jagakarsa | Klinik Dokter Gigi Spesialis', lat: -6.3311211904833495, lng: 106.8078603711646, city: 'Jakarta', address: 'Komplek Kahfi Square, Jl. Moh. Kahfi 1 No.36I, RT.7/RW.1, Ciganjur, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 5.0, reviews: 964, hours: '10:00-21:00', open: true, phone: '0811-1188-757', plusCode: 'MR95+F4 Ciganjur, Kota Jakarta Selatan', website: 'audydental.com', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/Audy.jpg',
                    'Gambar/gambar audy/klinik audy.webp',
                    'Gambar/gambar audy/klinik audy 2.webp',
                    'Gambar/gambar audy/klinik audy 3.jpg'
                ],
                operationalHours: {
                    'Minggu': '10.00 – 21.00',
                    'Senin': '10.00 – 21.00',
                    'Selasa': '10.00 – 21.00',
                    'Rabu': '10.00 – 21.00',
                    'Kamis': '10.00 – 21.00',
                    'Jumat': '10.00 – 21.00',
                    'Sabtu': '10.00 – 21.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar'],
                doctors: ['Drg. Audy Specialist', 'Drg. Sarah Dental'],
                userReviews: [
                    { author: 'Ahmad', comment: 'Pelayanan sangat memuaskan dan tempatnya bersih!' },
                    { author: 'Siti', comment: 'Dokternya ramah dan profesional, hasil perawatan sangat bagus.' },
                    { author: 'Budi', comment: 'Klinik modern dengan peralatan canggih, sangat recommended!' }
                ]
            }
        },
        { 
            id: 2, name: 'Atafera Dental Clinic (drg. Ferawati)', lat: -6.345890864279598, lng: 106.81126924232949, city: 'Jakarta', address: 'Jl. Wr. Sila No.111, RT.1/RW.4, Ciganjur, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 5.0, reviews: 172, hours: '16:00-21:00', open: false, phone: '0812-6592-9058', plusCode: 'MR36+HG Ciganjur, Kota Jakarta Selatan', website: 'Tidak tersedia', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/atafera.jpeg',
                    'Gambar/artafera/atafera1.webp',
                    'Gambar/artafera/atafera2.webp',
                    'Gambar/artafera/atafera3.webp'
                ],
                operationalHours: {
                    'Minggu': 'Tutup',
                    'Senin': '16.00 – 21.00',
                    'Selasa': '16.00 – 21.00',
                    'Rabu': '16.00 – 21.00',
                    'Kamis': '16.00 – 21.00',
                    'Jumat': '16.00 – 21.00',
                    'Sabtu': '16.00 – 21.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar'],
                doctors: ['Drg. Ferawati'],
                userReviews: [
                    { author: 'Dewi', comment: 'Dokter Ferawati sangat teliti dan ramah!' },
                    { author: 'Rina', comment: 'Pelayanan cepat dan hasil perawatan memuaskan.' },
                    { author: 'Hendra', comment: 'Klinik bersih dan nyaman untuk perawatan gigi.' }
                ]
            }
        },
        { 
            id: 3, name: 'JR Farma - Dokter Gigi', lat: -6.336023003695512, lng: 106.83474268650579, city: 'Jakarta', address: 'Jl. Raya Lenteng Agung, RT.5/RW.4, Srengseng Sawah, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 4.5, reviews: 19, hours: '08:30-21:00', open: false, phone: '0811-8128-596', plusCode: 'MR7M+GV Srengseng Sawah, Kota Jakarta Selatan', website: 'Tidak tersedia', type: 'Dokter Gigi',
            details: {
                gallery: [
                    'Gambar/JR farma.webp',
                    'Gambar/farma/JR Farma1.webp',
                    'Gambar/farma/JR Farma2.webp',
                    'Gambar/farma/JR Farma3.webp'
                ],
                operationalHours: {
                    'Minggu': 'Tutup',
                    'Senin': '08.30 – 21.00',
                    'Selasa': '08.30 – 21.00',
                    'Rabu': '08.30 – 21.00',
                    'Kamis': '08.30 – 21.00',
                    'Jumat': '08.30 – 21.00',
                    'Sabtu': '08.30 – 21.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar'],
                doctors: ['Drg. JR Farma'],
                userReviews: [
                    { author: 'Maya', comment: 'Pelayanan ramah dan harga terjangkau!' },
                    { author: 'Andi', comment: 'Dokter gigi yang berpengalaman dan teliti.' },
                    { author: 'Sari', comment: 'Klinik bersih dan peralatan modern.' }
                ]
            }
        },
        { 
            id: 4, name: 'Klinik Gigi Jakarta – FDC Fatmawati 1', lat: -6.270863207218399, lng: 106.79746304602322, city: 'Jakarta', address: 'Jl. RS. Fatmawati Raya No.15A, RT.1/RW.4, Gandaria Utara, Kec. Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12410', rating: 4.9, reviews: 8771, hours: '08:00-22:00', open: true, phone: '0811-1220-5816', plusCode: 'QPJW+HW Gandaria Utara, Kota Jakarta Selatan', website: 'fdcdentalclinic.co.id', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/gigi jakarta/Jakarta gigi.webp',
                    'Gambar/gigi jakarta/jakarta gigi1.webp',
                    'Gambar/gigi jakarta/jakarta gigi2.webp',
                    'Gambar/gigi jakarta/jakarta gigi3.webp'
                ],
                operationalHours: {
                    'Minggu': '08.00 – 22.00',
                    'Senin': '08.00 – 22.00',
                    'Selasa': '08.00 – 22.00',
                    'Rabu': '08.00 – 22.00',
                    'Kamis': '08.00 – 22.00',
                    'Jumat': '08.00 – 22.00',
                    'Sabtu': '08.00 – 22.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar', 'Konsultasi Gigi'],
                doctors: ['Drg. FDC Specialist', 'Drg. Fatmawati Dental'],
                userReviews: [
                    { author: 'Budi', comment: 'Klinik terpercaya dengan dokter spesialis berpengalaman!' },
                    { author: 'Ani', comment: 'Pelayanan 24 jam sangat membantu, hasil perawatan memuaskan.' },
                    { author: 'Rudi', comment: 'Fasilitas lengkap dan modern, sangat recommended!' }
                ]
            }
        },
        { 
            id: 5, name: 'Satu Dental Jagakarsa Kahfi | Klinik Gigi Dekat dan Terpercaya', lat: -6.329438421592248, lng: 106.80916910184686, city: 'Jakarta', address: 'Jl. Moh. Kahfi 1 No.123, Ciganjur, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 5.0, reviews: 103, hours: '09:00-21:00', open: true, phone: '0813-1200-0936', plusCode: 'MRC5+5J Ciganjur, Kota Jakarta Selatan', website: 'patients.satudental.com', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/satu dental/satu dental1.webp',
                    'Gambar/satu dental/satu dental2.webp',
                    'Gambar/satu dental/satu dental3.webp',
                    'Gambar/satu dental/satu dental4.webp'
                ],
                operationalHours: {
                    'Minggu': '09.00 – 18.00',
                    'Senin': '09.00 – 21.00',
                    'Selasa': '09.00 – 21.00',
                    'Rabu': '09.00 – 21.00',
                    'Kamis': '09.00 – 21.00',
                    'Jumat': '09.00 – 21.00',
                    'Sabtu': '09.00 – 18.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar'],
                doctors: ['Drg. Satu Dental', 'Drg. Kahfi Specialist'],
                userReviews: [
                    { author: 'Dina', comment: 'Klinik terpercaya dengan pelayanan yang memuaskan!' },
                    { author: 'Eko', comment: 'Dokter ramah dan profesional, hasil perawatan bagus.' },
                    { author: 'Lina', comment: 'Lokasi strategis dan harga terjangkau.' }
                ]
            }
        },
        { 
            id: 6, name: 'Klinik Dokter Gigi Lenteng Agung | TARS Dental Care Depok', lat: -6.337988898081008, lng: 106.83618482088171, city: 'Jakarta', address: 'Jl. Lenteng Agung Raya No.8A, Lenteng Agung, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 5.0, reviews: 59, hours: '10:00-21:00', open: true, phone: '0812-8000-6461', plusCode: 'MR6P+P9 Lenteng Agung, Kota Jakarta Selatan', website: 'tarsdentalcare.com', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/lenteng/lenteng1.webp',
                    'Gambar/lenteng/lenteng2.webp',
                    'Gambar/lenteng/lenteng3.webp',
                    'Gambar/lenteng/lenteng4.webp'
                ],
                operationalHours: {
                    'Minggu': '10.00 – 21.00',
                    'Senin': '10.00 – 21.00',
                    'Selasa': '10.00 – 21.00',
                    'Rabu': '10.00 – 21.00',
                    'Kamis': '10.00 – 21.00',
                    'Jumat': '10.00 – 21.00',
                    'Sabtu': '10.00 – 21.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar'],
                doctors: ['Drg. TARS Specialist', 'Drg. Lenteng Agung'],
                userReviews: [
                    { author: 'Rina', comment: 'Pelayanan sangat profesional dan hasil perawatan memuaskan!' },
                    { author: 'Ahmad', comment: 'Dokter gigi yang berpengalaman dan teliti.' },
                    { author: 'Siti', comment: 'Klinik modern dengan peralatan canggih.' }
                ]
            }
        },
        { 
            id: 7, name: 'AHLI GIGI Cahaya Dental', lat: -6.351439496145871, lng: 106.80163561534107, city: 'Jakarta', address: 'Jl. Moh. Kahfi 1, RT.10/RW.4, Cipedak, Kec. Jagakarsa, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12630', rating: 4.8, reviews: 18, hours: '24 Jam', open: true, phone: '0812-8357-6169', plusCode: 'JRX2+9J Cipedak, Kota Jakarta Selatan', website: 'ahligigicahayadental.com', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/dental gigi/gigi dental1.webp',
                    'Gambar/dental gigi/dental gigi2.webp',
                    'Gambar/dental gigi/dental gigi3.webp',
                    'Gambar/dental gigi/dental gigi4.webp'
                ],
                operationalHours: {
                    'Senin - Minggu': '24 Jam'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar', 'Dental Emergency'],
                doctors: ['Drg. Cahaya Dental', 'Drg. Emergency Specialist'],
                userReviews: [
                    { author: 'Budi', comment: 'Pelayanan 24 jam sangat membantu untuk emergency!' },
                    { author: 'Maya', comment: 'Dokter gigi yang siap melayani kapan saja.' },
                    { author: 'Hendra', comment: 'Klinik bersih dan peralatan lengkap.' }
                ]
            }
        },
        { 
            id: 8, name: 'Klinik Gigi Jakarta – FDC Pasar Minggu', lat: -6.266906705600392, lng: 106.84543488650579, city: 'Jakarta', address: 'Jl. KH. Guru Amin No.13C-D, RT.12/RW.6, Pejaten Timur, Ps. Minggu, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12510', rating: 5.0, reviews: 5548, hours: '08:00-22:00', open: true, phone: '0811-1923-1089', plusCode: 'PRMW+55 Pejaten Timur, Kota Jakarta Selatan', website: 'fdcdentalclinic.co.id', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/pasar minggu/pasar minggu1.webp',
                    'Gambar/pasar minggu/pasar minggu2.webp',
                    'Gambar/pasar minggu/pasar minggu3.webp',
                    'Gambar/pasar minggu/pasar minggu4.webp'
                ],
                operationalHours: {
                    'Minggu': '08.00 – 22.00',
                    'Senin': '08.00 – 22.00',
                    'Selasa': '08.00 – 22.00',
                    'Rabu': '08.00 – 22.00',
                    'Kamis': '08.00 – 22.00',
                    'Jumat': '08.00 – 22.00',
                    'Sabtu': '08.00 – 22.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar', 'Konsultasi Gigi'],
                doctors: ['Drg. FDC Pasar Minggu', 'Drg. Specialist'],
                userReviews: [
                    { author: 'Dewi', comment: 'Klinik terpercaya dengan dokter spesialis berpengalaman!' },
                    { author: 'Rudi', comment: 'Pelayanan cepat dan hasil perawatan memuaskan.' },
                    { author: 'Ani', comment: 'Fasilitas lengkap dan modern, sangat recommended!' }
                ]
            }
        },
        { 
            id: 9, name: 'Klinik Gigi Lebak Bulus Jakarta Selatan – Damessa Family Dental Care', lat: -6.299379311067983, lng: 106.77717852883526, city: 'Jakarta', address: 'Ruko Victory 88, 88i Jl. Lebak Bulus Raya Blok Z1 Kav, Jl. Lebak Bulus Raya No.21, Lb. Bulus, Kec. Cilandak, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12440', rating: 5.0, reviews: 258, hours: '09:00-21:00', open: true, phone: '0811-8711-127', plusCode: 'PQ2G+5V Lb. Bulus, Kota Jakarta Selatan', website: 'damessa.id', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/lebak bulus/lebak bulus1.webp',
                    'Gambar/lebak bulus/lebak bulus2.webp',
                    'Gambar/lebak bulus/lebak bulus3.webp',
                    'Gambar/lebak bulus/lebak bulus4.webp'
                ],
                operationalHours: {
                    'Minggu': '09.00 – 21.00',
                    'Senin': '09.00 – 21.00',
                    'Selasa': '09.00 – 21.00',
                    'Rabu': '09.00 – 21.00',
                    'Kamis': '09.00 – 21.00',
                    'Jumat': '09.00 – 21.00',
                    'Sabtu': '09.00 – 21.00'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar', 'Family Dental Care'],
                doctors: ['Drg. Damessa', 'Drg. Family Specialist'],
                userReviews: [
                    { author: 'Sari', comment: 'Klinik keluarga yang nyaman dan terpercaya!' },
                    { author: 'Budi', comment: 'Pelayanan ramah untuk semua usia.' },
                    { author: 'Maya', comment: 'Dokter gigi yang berpengalaman dengan anak-anak.' }
                ]
            }
        },
        { 
            id: 10, name: 'Axel Dental Condet – Klinik Gigi Pilihan Keluarga Indonesia', lat: -6.29313738052696, lng: 106.85564991349418, city: 'Jakarta', address: 'Jl. Condet Raya R3 Lantai 2, Kec. Kramat Jati, Jakarta, Daerah Khusus Ibukota Jakarta 13530', rating: 5.0, reviews: 703, hours: '10:00-20:30', open: true, phone: '0811-8461-800', plusCode: 'PV44+M7 Balekambang, Kota Jakarta Timur', website: 'axeldental.id', type: 'Klinik Gigi',
            details: {
                gallery: [
                    'Gambar/axel dental/axel dental (1).webp',
                    'Gambar/axel dental/axel dental (2).webp',
                    'Gambar/axel dental/axel dental (3).webp',
                    'Gambar/axel dental/axel dental (4).webp'
                ],
                operationalHours: {
                    'Minggu': '10.00 – 20.30',
                    'Senin': '10.00 – 20.30',
                    'Selasa': '10.00 – 20.30',
                    'Rabu': '10.00 – 20.30',
                    'Kamis': '10.00 – 20.30',
                    'Jumat': '10.00 – 20.30',
                    'Sabtu': '10.00 – 20.30'
                },
                services: ['Scaling', 'Tambal Gigi', 'Behel (Orthodontics)', 'Implant Gigi', 'Gigi Tiruan', 'Pemutihan Gigi', 'Perawatan Saluran Akar', 'Family Dental Care'],
                doctors: ['Drg. Axel Dental', 'Drg. Condet Specialist'],
                userReviews: [
                    { author: 'Rina', comment: 'Klinik pilihan keluarga dengan pelayanan terbaik!' },
                    { author: 'Ahmad', comment: 'Dokter gigi yang ramah dan profesional.' },
                    { author: 'Dewi', comment: 'Fasilitas lengkap dan modern untuk keluarga.' }
                ]
            }
        }
    ];

    function initMap(lat, lng) {
        currentUserPosition = { lat, lng };
        
        if (map) {
            map.setView([lat, lng], 13);
        } else {
            map = L.map('map').setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        // Add or update user location marker
        if (userMarker) {
            userMarker.setLatLng([lat, lng]);
        } else {
            userMarker = L.marker([lat, lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map)
                .bindPopup('<b>Lokasi Anda</b>')
                .openPopup();
        }
    }

    function addClinicMarkers(clinics) {
        // Clear previous clinic markers
        clinicMarkers.forEach(marker => map.removeLayer(marker));
        clinicMarkers = [];

        clinics.forEach(clinic => {
            const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng).toFixed(1);
            const marker = L.marker([clinic.lat, clinic.lng]).addTo(map);
            const popupContent = `<b>${clinic.name}</b><br>${clinic.address}, ${clinic.city}<br>Jarak: ${distance} km`;
            marker.bindPopup(popupContent);

            marker.on('click', () => {
                highlightCard(clinic.id, true);
                lastOpenedPopup = marker;
            });
            
            clinic.marker = marker; // Associate marker with clinic data
            clinicMarkers.push(marker);
        });
        
        map.on('click', () => {
        unhighlightAllCards();
        });
    }

    function updateClinicList(clinics) {
        clinicList.innerHTML = ''; // Clear existing list
        clinicList.classList.add('loading');

        setTimeout(() => { // Simulate network delay
            if (clinics.length === 0) {
                clinicList.innerHTML = '<p style="text-align: center; width: 100%;">Tidak ada klinik yang ditemukan sesuai kriteria Anda.</p>';
            } else {
                clinics.forEach(clinic => {
                    const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng).toFixed(1);
                    const card = document.createElement('div');
                    card.className = 'clinic-card';
                    card.dataset.clinicId = clinic.id;
                    card.innerHTML = `
                        <img src="${clinic.details?.gallery?.[0] || 'https://via.placeholder.com/300x200.png?text=Klinik'}" alt="Foto ${clinic.name}">
                        <div class="clinic-card-content">
                            <h3>${clinic.name}</h3>
                            <div class="clinic-meta">
                                <span class="distance"><i class="fas fa-road"></i> ${distance} km</span>
                                <span class="rating"><i class="fas fa-star"></i> ${clinic.rating} (${clinic.reviews} reviews)</span>
                            </div>
                            <div class="clinic-hours">
                                <i class="fas fa-clock"></i> ${isClinicOpenNow(clinic) ? 'Buka' : 'Tutup'}: ${clinic.hours}
                            </div>
                            <div class="card-buttons">
                                <button class="btn-secondary btn-detail" data-clinic-id="${clinic.id}">Detail</button>
                                <button class="btn-primary btn-navigate" data-clinic-id="${clinic.id}" data-lat="${clinic.lat}" data-lng="${clinic.lng}">Arahkan</button>
                            </div>
                        </div>
                    `;
                    clinicList.appendChild(card);
                });
            }
            clinicList.classList.remove('loading');
        }, 300); // 300ms delay
    }

    // Fungsi cek buka sekarang
    function isClinicOpenNow(clinic) {
        const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const now = new Date();
        const hariIni = hari[now.getDay()];
        const jamSekarang = now.getHours() + now.getMinutes() / 60;
        const jamBukaTutup = clinic.details?.operationalHours?.[hariIni] || clinic.details?.operationalHours?.['Senin - Minggu'];
        if (!jamBukaTutup || jamBukaTutup.toLowerCase() === 'tutup') return false;
        if (jamBukaTutup.toLowerCase().includes('24 jam')) return true;
        const match = jamBukaTutup.match(/(\d{1,2})[.:](\d{2})\s*[–-]\s*(\d{1,2})[.:](\d{2})/);
        if (!match) return false;
        const buka = parseInt(match[1]) + parseInt(match[2]) / 60;
        const tutup = parseInt(match[3]) + parseInt(match[4]) / 60;
        return jamSekarang >= buka && jamSekarang <= tutup;
    }

    // Fungsi utama filter & paging
    function filterAndDisplayClinics(page = 1) {
        let clinics = dummyClinics.map(clinic => {
            const distance = calculateDistance(currentUserPosition.lat, currentUserPosition.lng, clinic.lat, clinic.lng);
            return { ...clinic, distance };
        });
        // Urutkan berdasarkan jarak terdekat
        clinics.sort((a, b) => a.distance - b.distance);
        // Ambil rentang radius
        let radiusRange = document.getElementById('radius-filter').value.split('-');
        let minRadius = parseFloat(radiusRange[0]) || 0;
        let maxRadius = parseFloat(radiusRange[1]) || 99999;
        let minRating = parseFloat(document.getElementById('rating-filter').value);
        let openNow = document.getElementById('open-now-filter').checked;
        let searchTerm = document.getElementById('search-input').value.toLowerCase();
        const filteredClinics = clinics.filter(clinic => {
            const inRadius = clinic.distance >= minRadius && clinic.distance <= maxRadius;
            const hasGoodRating = clinic.rating >= minRating;
            const isOpen = !openNow || isClinicOpenNow(clinic);
            const matchesSearch = clinic.name.toLowerCase().includes(searchTerm) ||
            clinic.address.toLowerCase().includes(searchTerm) ||
            clinic.city.toLowerCase().includes(searchTerm);
            return inRadius && hasGoodRating && isOpen && matchesSearch;
        });
        filteredClinicsGlobal = filteredClinics;
        currentPage = page;
        showPaginatedClinics();
    }

    function showPaginatedClinics() {
        let clinicsToShow;
        let totalClinics;
        let totalPages;
        // Hilangkan duplikat berdasarkan id
        const uniqueClinics = [];
        const seenIds = new Set();
        for (const c of filteredClinicsGlobal) {
            if (!seenIds.has(c.id)) {
                uniqueClinics.push(c);
                seenIds.add(c.id);
            }
        }
        if (!isUserLocated) {
            totalClinics = uniqueClinics.length;
            totalPages = Math.ceil(totalClinics / clinicsPerPage);
            clinicsToShow = uniqueClinics.slice((currentPage - 1) * clinicsPerPage, currentPage * clinicsPerPage);
        } else {
            totalClinics = uniqueClinics.length;
            totalPages = Math.ceil(totalClinics / clinicsPerPage);
            clinicsToShow = uniqueClinics.slice((currentPage - 1) * clinicsPerPage, currentPage * clinicsPerPage);
        }
        addClinicMarkers(clinicsToShow);
        updateClinicList(clinicsToShow);
        if (resultsInfo) {
            resultsInfo.innerHTML = `Menampilkan ${clinicsToShow.length} dari ${totalClinics} klinik (Halaman ${currentPage} dari ${totalPages})`;
        }
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = currentPage === totalPages || totalPages === 0;
    }

    // === Event Delegation for Clinic Cards ===
    clinicList.addEventListener('click', e => {
        const card = e.target.closest('.clinic-card');
        if (!card) return;

        const clinicId = parseInt(card.dataset.clinicId);
        const clinic = dummyClinics.find(c => c.id === clinicId);

        if (e.target.classList.contains('btn-detail')) {
            showClinicModal(clinic);
        } else {
            // Fly to location on map
            map.flyTo([clinic.lat, clinic.lng], 15);
            clinic.marker.openPopup();
            highlightCard(clinicId, false);
            lastOpenedPopup = clinic.marker;
        }
    });

    // === Modal Logic ===
    function showClinicModalOld(clinic) {
        modalBody.innerHTML = `
            <div class="modal-clinic-header">
                <h2>${clinic.name}</h2>
                <p>${clinic.address}, ${clinic.city}</p>
            </div>
            ${clinic.details.gallery ? `
            <div class="modal-section">
                <h4>Galeri</h4>
                <div class="clinic-gallery">
                    ${clinic.details.gallery.map(img => `<img src="${img}" alt="Galeri ${clinic.name}">`).join('')}
                </div>
            </div>` : ''}
            ${clinic.details.services ? `
            <div class="modal-section">
                <h4>Layanan Unggulan</h4>
                <ul>${clinic.details.services.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>` : ''}
            ${clinic.details.doctors ? `
            <div class="modal-section">
                <h4>Dokter Praktik</h4>
                <ul>${clinic.details.doctors.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>` : ''}
            ${clinic.details.userReviews ? `
            <div class="modal-section">
                <h4>Ulasan Pasien</h4>
                ${clinic.details.userReviews.map(r => `
                    <div class="review">
                        <p>"${r.comment}"</p>
                        <p class="review-author">- ${r.author}</p>
                    </div>`).join('')}
            </div>` : ''}
        `;
        modal.classList.add('active');
    }

    function hideClinicModal() {
        modal.classList.remove('active');
        // Re-enable body scroll
        document.body.classList.remove('modal-open');
    }

    closeModalBtn.addEventListener('click', hideClinicModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            hideClinicModal();
        }
    });

    // === Card Highlighting Logic ===
    function highlightCard(clinicId, fromMarker) {
        unhighlightAllCards();
        const card = document.querySelector(`.clinic-card[data-clinic-id="${clinicId}"]`);
        if (card) {
            card.classList.add('active');
            if (!fromMarker) { // If click from card, scroll it into view
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    function unhighlightAllCards() {
        document.querySelectorAll('.clinic-card.active').forEach(c => c.classList.remove('active'));
    }

    // === Modal Popup Functions ===
    function showClinicModal(clinicId) {
        const clinic = dummyClinics.find(c => c.id === clinicId);
        if (!clinic) return;

        document.body.classList.add('modal-open');

        modalBody.innerHTML = `
            <div class="modal-clinic-header">
                <div class="clinic-gallery">
                    <div class="gallery-main">
                        <img src="${clinic.details?.gallery?.[0] || 'Gambar/Audy.jpg'}" alt="${clinic.name}" class="clinic-main-image fullscreenable" onclick="openFullscreenImage(this.src)">
                    </div>
                    <div class="gallery-thumbnails">
                        ${clinic.details?.gallery?.slice(0, 4).map((img, index) => `
                            <div class="thumbnail-item ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                                <img src="${img}" alt="Galeri ${clinic.name}">
                            </div>
                        `).join('') || ''}
                    </div>
                </div>
                <div class="clinic-info-header">
                    <h2 class="modal-clinic-title">${clinic.name}</h2>
                    <div class="clinic-rating-info">
                        <div class="stars">${'⭐'.repeat(Math.floor(clinic.rating))}</div>
                        <span class="rating-text">Rating: ⭐ ${clinic.rating} (${clinic.reviews} ulasan)</span>
                        <span class="clinic-status ${isClinicOpenNow(clinic) ? 'open' : 'closed'}">${isClinicOpenNow(clinic) ? 'Buka' : 'Tutup'}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-content-details">
                <div class="detail-section">
                    <h4><i class="fas fa-hospital"></i> Jenis</h4>
                    <p>${clinic.type || 'Klinik Gigi'}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Alamat</h4>
                    <p>${clinic.address}, ${clinic.city}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-clock"></i> Jam Operasional</h4>
                    <div class="operational-hours">
                        ${Object.entries(clinic.details?.operationalHours || {}).map(([day, hours]) => {
                            const isToday = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()] === day;
                            const isOpen = isToday && isClinicOpenNow(clinic);
                            return `
                                <div class="day-row ${isToday ? 'today' : ''}">
                                    <span class="day">${day}:</span>
                                    <span class="hours ${isOpen ? 'open-now' : ''}">${hours}</span>
                                    ${isToday ? `<span class="status-indicator ${isOpen ? 'open' : 'closed'}">${isOpen ? 'Buka' : 'Tutup'}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-phone"></i> Telepon</h4>
                    <p><a href="tel:${clinic.phone}" class="contact-link">${clinic.phone}</a></p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-map-pin"></i> Plus Code</h4>
                    <p>${clinic.plusCode}</p>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-globe"></i> Website</h4>
                    <p><a href="https://${clinic.website}" target="_blank" class="contact-link">${clinic.website}</a></p>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-primary" onclick="navigateToClinic(${clinic.lat}, ${clinic.lng})">
                    <i class="fas fa-directions"></i> Arahkan ke Klinik
                </button>
                <a href="tel:${clinic.phone}" class="btn-secondary">
                    <i class="fas fa-phone"></i> Hubungi Sekarang
                </a>
            </div>
        `;
        modal.classList.add('active');
        
        // Handle image load errors for all images in modal
        const images = modal.querySelectorAll('img');
        images.forEach(img => {
            img.onerror = function() {
                if (this.classList.contains('clinic-main-image')) {
                    this.src = 'Gambar/Audy.jpg';
                }
            };
        });
    }

    // Tambahkan fungsi untuk fullscreen image
    window.openFullscreenImage = function(src) {
        // Buat overlay fullscreen
        let overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 9999;
        overlay.style.cursor = 'zoom-out';
        overlay.innerHTML = `<img src="${src}" style="max-width:98vw; max-height:98vh; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.4);">`;
        overlay.onclick = function() {
            document.body.removeChild(overlay);
        };
        document.body.appendChild(overlay);
    };

    // Function to change main image in gallery
window.changeMainImage = function(imageSrc, thumbnailElement) {
    const mainImage = document.querySelector('.clinic-main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
        
        // Handle image load error
        mainImage.onerror = function() {
            this.src = 'Gambar/Audy.jpg'; // Fallback to Audy.jpg
        };
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail-item').forEach(item => {
        item.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
};

    // === Navigation Function ===
    function navigateToClinic(lat, lng) {
        // Open Google Maps with driving directions
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
    }

    // Make function globally available for onclick
    window.navigateToClinic = function(lat, lng) {
        navigateToClinic(lat, lng);
    };



    // === Event Listeners for Modal ===
    closeModalBtn.addEventListener('click', hideClinicModal);
    
    // Prevent clicks on modal background from closing modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideClinicModal();
        }
    });

    // Prevent modal content clicks from closing modal
    modal.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Allow scroll on modal content, prevent on background
    modal.addEventListener('wheel', (e) => {
        const modalContent = modal.querySelector('.modal-content');
        const isScrollable = modalContent.scrollHeight > modalContent.clientHeight;
        const isAtTop = modalContent.scrollTop === 0;
        const isAtBottom = modalContent.scrollTop + modalContent.clientHeight >= modalContent.scrollHeight;
        
        // If content is not scrollable, prevent scroll
        if (!isScrollable) {
            e.preventDefault();
            return;
        }
        
        // If scrolling up and at top, or scrolling down and at bottom, prevent scroll
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
            e.preventDefault();
        }
        
        // Allow scroll within modal content
        e.stopPropagation();
    });

    // Prevent keyboard events on modal background
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideClinicModal();
        }
    });

    // Handle touch events for mobile scrolling
    modal.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    }, { passive: true });

    modal.addEventListener('touchmove', (e) => {
        const modalContent = modal.querySelector('.modal-content');
        const isScrollable = modalContent.scrollHeight > modalContent.clientHeight;
        
        if (!isScrollable) {
            e.preventDefault();
        }
        e.stopPropagation();
    }, { passive: false });

    // === Event Delegation for Clinic Card Buttons ===
    clinicList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detail')) {
            const clinicId = parseInt(e.target.getAttribute('data-clinic-id'));
            showClinicModal(clinicId);
        } else if (e.target.classList.contains('btn-navigate')) {
            const lat = parseFloat(e.target.getAttribute('data-lat'));
            const lng = parseFloat(e.target.getAttribute('data-lng'));
            navigateToClinic(lat, lng);
        }
    });

    // === Navigasi Klinik (Berikutnya/Sebelumnya) ===
    document.getElementById('next-btn').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredClinicsGlobal.length / clinicsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            showPaginatedClinics();
        }
    });
    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            showPaginatedClinics();
        }
    });

    // === Geolocation API ===
    findNearbyBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
            findNearbyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari lokasi...';
            findNearbyBtn.disabled = true;
            // Hentikan watchPosition sebelumnya jika ada
            if (geoWatchId !== null) {
                navigator.geolocation.clearWatch(geoWatchId);
            }
            geoWatchId = navigator.geolocation.watchPosition(position => {
                const { latitude, longitude } = position.coords;
                isUserLocated = true;
                currentUserPosition = { lat: latitude, lng: longitude };
                initMap(latitude, longitude);
                filterAndDisplayClinics(1);
                findNearbyBtn.style.display = 'none';
            }, error => {
                console.error('Error getting location:', error);
                alert('Tidak bisa mendapatkan lokasi. Menampilkan lokasi default (Jakarta).');
                isUserLocated = false;
                currentUserPosition = { lat: -6.2088, lng: 106.8456 };
                initMap(-6.2088, 106.8456);
                filterAndDisplayClinics(1);
                findNearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Gunakan Lokasi Saya';
                findNearbyBtn.disabled = false;
            }, { enableHighAccuracy: true });
        } else {
            alert('Geolocation tidak didukung oleh browser Anda.');
            isUserLocated = false;
            currentUserPosition = { lat: -6.2088, lng: 106.8456 };
            initMap(-6.2088, 106.8456);
            filterAndDisplayClinics(1);
        }
    });

    // === Filter Event Listeners ===
    // Event filter selalu aktif
    document.getElementById('radius-filter').addEventListener('change', () => filterAndDisplayClinics(1));
    document.getElementById('rating-filter').addEventListener('change', () => filterAndDisplayClinics(1));
    document.getElementById('open-now-filter').addEventListener('change', () => filterAndDisplayClinics(1));
    document.getElementById('search-btn').addEventListener('click', () => filterAndDisplayClinics(1));
    document.getElementById('search-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && isUserLocated) {
            filterAndDisplayClinics(1);
        }
    });
    document.getElementById('clear-filters-btn').onclick = () => {
        document.getElementById('search-input').value = '';
        document.getElementById('radius-filter').selectedIndex = 0;
        document.getElementById('rating-filter').selectedIndex = 0;
        document.getElementById('open-now-filter').checked = false;
        isUserLocated = false;
        currentUserPosition = { lat: -6.2088, lng: 106.8456 };
        findNearbyBtn.style.display = '';
        initMap(currentUserPosition.lat, currentUserPosition.lng);
        filterAndDisplayClinics(1);
    };

    // Set default radius ke 25 km saat load pertama
    document.getElementById('radius-filter').value = '25';

    // === Helper Function to Calculate Distance (Haversine formula) ===
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // === Initial state (show map of Jakarta by default) ===
    function showDefaultView() {
        isUserLocated = false;
        currentUserPosition = { lat: -6.2088, lng: 106.8456 };
        initMap(currentUserPosition.lat, currentUserPosition.lng);
        filterAndDisplayClinics(1);
    }
    
    showDefaultView();

});

