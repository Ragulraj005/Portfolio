   // JavaScript for scroll-triggered animations
    document.addEventListener("DOMContentLoaded", () => {
      const faders = document.querySelectorAll(".fade-in");

      const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
      };

      const appearOnScroll = new IntersectionObserver(function (
        entries,
        appearOnScroll
      ) {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          } else {
            entry.target.classList.add("appear");
            appearOnScroll.unobserve(entry.target);
          }
        });
      }, appearOptions);

      faders.forEach(fader => {
        appearOnScroll.observe(fader);
      });

      // Three.js Background Animation - Connected Particle Network
      let scene, camera, renderer, particles, lineMesh;
      const particleCount = 200;
      const particleSize = 0.04;
      const maxConnectionDistance = 2;
      const particleSpeed = 0.0005;

      let mouseX = 0,
        mouseY = 0;
      let windowHalfX = window.innerWidth / 2;
      let windowHalfY = window.innerHeight / 2;

      function initThreeJs() {
        const canvas = document.getElementById('threeJsCanvas');
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const pGeometry = new THREE.BufferGeometry();
        const pPositions = new Float32Array(particleCount * 3);
        const pVelocities = new Float32Array(particleCount * 3);
        const pColors = new Float32Array(particleCount * 3);

        // Initialize particle positions and velocities
        for (let i = 0; i < particleCount; i++) {
          pPositions[i * 3] = (Math.random() - 0.5) * 10;
          pPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
          pPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;

          pVelocities[i * 3] = (Math.random() - 0.5) * particleSpeed;
          pVelocities[i * 3 + 1] = (Math.random() - 0.5) * particleSpeed;
          pVelocities[i * 3 + 2] = (Math.random() - 0.5) * particleSpeed;
        }

        pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
        pGeometry.setAttribute('velocity', new THREE.BufferAttribute(pVelocities, 3));
        pGeometry.setAttribute('color', new THREE.BufferAttribute(pColors, 3)); // Will be updated dynamically

        const pMaterial = new THREE.PointsMaterial({
          size: particleSize,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.8
        });

        particles = new THREE.Points(pGeometry, pMaterial);
        scene.add(particles);

        const maxLines = particleCount * (particleCount - 1) / 2;
        const lPositions = new Float32Array(maxLines * 2 * 3);
        const lColors = new Float32Array(maxLines * 2 * 3);
        const lGeometry = new THREE.BufferGeometry();
        lGeometry.setAttribute('position', new THREE.BufferAttribute(lPositions, 3));
        lGeometry.setAttribute('color', new THREE.BufferAttribute(lColors, 3));

        const lMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.2,
          linewidth: 1
        });

        lineMesh = new THREE.LineSegments(lGeometry, lMaterial);
        scene.add(lineMesh);

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

        // Initial color update for Three.js
        updateThreeJsColors();
      }

      function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
      }

      function onDocumentTouchMove(event) {
        if (event.touches.length === 1) {
          event.preventDefault();
          mouseX = event.touches[0].pageX - windowHalfX;
          mouseY = event.touches[0].pageY - windowHalfY;
        }
      }

      function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      // Function to update Three.js particle and line colors based on current CSS variables
      function updateThreeJsColors() {
        const rootStyles = getComputedStyle(document.documentElement);
        const primaryAccentColor = new THREE.Color(rootStyles.getPropertyValue('--primary-accent'));
        const secondaryAccentColor = new THREE.Color(rootStyles.getPropertyValue('--secondary-accent'));

        const pColors = particles.geometry.attributes.color.array;

        // Update particle colors
        for (let i = 0; i < particleCount; i++) {
          const mixedColor = new THREE.Color().copy(primaryAccentColor);
          mixedColor.lerp(secondaryAccentColor, (i / particleCount)); // Consistent interpolation
          pColors[i * 3] = mixedColor.r;
          pColors[i * 3 + 1] = mixedColor.g;
          pColors[i * 3 + 2] = mixedColor.b;
        }
        particles.geometry.attributes.color.needsUpdate = true;
      }

      function animate() {
        requestAnimationFrame(animate);

        const pPositions = particles.geometry.attributes.position.array;
        const pVelocities = particles.geometry.attributes.velocity.array;
        const pColors = particles.geometry.attributes.color.array;

        const lPositions = lineMesh.geometry.attributes.position.array;
        const lColors = lineMesh.geometry.attributes.color.array;
        let lineIndex = 0;

        camera.position.x += (mouseX * 0.001 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.001 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        const tempParticleVector = new THREE.Vector3();

        for (let i = 0; i < particleCount; i++) {
          pPositions[i * 3] += pVelocities[i * 3];
          pPositions[i * 3 + 1] += pVelocities[i * 3 + 1];
          pPositions[i * 3 + 2] += pVelocities[i * 3 + 2];

          if (pPositions[i * 3] > 5 || pPositions[i * 3] < -5) pVelocities[i * 3] *= -1;
          if (pPositions[i * 3 + 1] > 5 || pPositions[i * 3 + 1] < -5) pVelocities[i * 3 + 1] *= -1;
          if (pPositions[i * 3 + 2] > 5 || pPositions[i * 3 + 2] < -5) pVelocities[i * 3 + 2] *= -1;
        }

        for (let i = 0; i < particleCount; i++) {
          tempParticleVector.set(pPositions[i * 3], pPositions[i * 3 + 1], pPositions[i * 3 + 2]);

          for (let j = i + 1; j < particleCount; j++) {
            const otherParticleVector = new THREE.Vector3(pPositions[j * 3], pPositions[j * 3 + 1], pPositions[j *
              3 + 2]);
            const dist = tempParticleVector.distanceTo(otherParticleVector);

            if (dist < maxConnectionDistance) {
              // Apply line segments
              lPositions[lineIndex * 6] = pPositions[i * 3];
              lPositions[lineIndex * 6 + 1] = pPositions[i * 3 + 1];
              lPositions[lineIndex * 6 + 2] = pPositions[i * 3 + 2];

              lColors[lineIndex * 6] = pColors[i * 3];
              lColors[lineIndex * 6 + 1] = pColors[i * 3 + 1];
              lColors[lineIndex * 6 + 2] = pColors[i * 3 + 2];

              lPositions[lineIndex * 6 + 3] = pPositions[j * 3];
              lPositions[lineIndex * 6 + 4] = pPositions[j * 3 + 1];
              lPositions[lineIndex * 6 + 5] = pPositions[j * 3 + 2];

              lColors[lineIndex * 6 + 3] = pColors[j * 3];
              lColors[lineIndex * 6 + 4] = pColors[j * 3 + 1];
              lColors[lineIndex * 6 + 5] = pColors[j * 3 + 2];

              lineIndex++;
            }
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        lineMesh.geometry.attributes.position.needsUpdate = true;
        lineMesh.geometry.attributes.color.needsUpdate = true;
        lineMesh.geometry.setDrawRange(0, lineIndex * 2);

        renderer.render(scene, camera);
      }

      // Theme Toggle Logic
      const themeToggleButton = document.getElementById('themeToggle');
      themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('synthwave-theme');
        updateThreeJsColors(); // Update Three.js colors after theme switch
      });

      window.onload = function () {
        initThreeJs();
        animate();
      };
    });