
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        scene.fog = new THREE.FogExp2(0x2C1B61, 0.005);
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshBasicMaterial({
            color: 'black',
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
        let composer = new THREE.EffectComposer(renderer);
        let renderScene = new THREE.RenderPass(scene, camera);
        composer.addPass(renderScene);
        let renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);
        let bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            .6,
            0.01,
            0.1
        );
        let bloomComposer = new THREE.EffectComposer(renderer);
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);
        composer.addPass(bloomPass);
        let afterimagePass = new THREE.AfterimagePass();
        afterimagePass.uniforms['damp'].value = 0.1;
        composer.addPass(afterimagePass);
        const cubes = [];
        for (let i = 0; i < 100; i++) {
            const cubeGeometry = new THREE.BoxGeometry(5, 5, 5);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(
                (Math.random() - 0.5) * 500,
                2.5,
                (Math.random() - 0.5) * 500
            );
            scene.add(cube);
            const cubeBox = new THREE.Box3().setFromObject(cube);
            cubes.push({
                mesh: cube,
                box: cubeBox
            });
        }
        const playerGeometry = new THREE.BoxGeometry(5, 5, 5);
        const playerMaterial = new THREE.MeshBasicMaterial({
            color: 'white'
        });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(0, 2.5, 0);
        scene.add(player);
        const cameraOffset = new THREE.Vector3(0, 20, 40);
        let cameraRotationY = 0;
        const playerDirection = new THREE.Vector3(0, 0, -1);
        let isMoving = false;
        let mouseX = 0;
        let isMouseDown = false;

        document.addEventListener('mousedown', () => {
            isMouseDown = true;
        });
        document.addEventListener('mouseup', () => {
            isMouseDown = true;
        });
        document.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                const mouseDeltaX = event.movementX;
                cameraRotationY -= mouseDeltaX * 0.008;
            }
        });

        const playerSpeed = 1.2;
        const rotationSpeed = 0.05;
        const keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        document.addEventListener('keydown', (event) => {
            if (event.code === 'ArrowUp' || event.code == 'KeyW') keys.forward = true;
            if (event.code === 'ArrowDown' || event.code == 'KeyS') keys.backward = true;
            if (event.code === 'ArrowLeft' || event.code == 'KeyA') keys.left = true;
            if (event.code === 'ArrowRight' || event.code == 'KeyD') keys.right = true;
        });
        document.addEventListener('keyup', (event) => {
            if (event.code === 'ArrowUp' || event.code == 'KeyW') keys.forward = false;
            if (event.code === 'ArrowDown' || event.code == 'KeyS') keys.backward = false;
            if (event.code === 'ArrowLeft' || event.code == 'KeyA') keys.left = false;
            if (event.code === 'ArrowRight' || event.code == 'KeyD') keys.right = false;
        });

        function updatePlayerMovement() {

            const direction = new THREE.Vector3(
                Math.sin(cameraRotationY),
                0,
                Math.cos(cameraRotationY)
            ).normalize();
            const rightDirection = new THREE.Vector3(
                Math.sin(cameraRotationY - Math.PI / 2),
                0,
                Math.cos(cameraRotationY - Math.PI / 2)
            ).normalize();
            let moveDistance = playerSpeed;
            if (keys.forward) {
                player.position.add(direction.clone().multiplyScalar(-moveDistance));
                if (checkCollision()) {
                    player.position.add(direction.clone().multiplyScalar(moveDistance));
                } else {
                    player.rotation.y = cameraRotationY;
                }
            }
            if (keys.backward) {
                player.position.add(direction.clone().multiplyScalar(moveDistance));
                if (checkCollision()) {
                    player.position.add(direction.clone().multiplyScalar(-moveDistance));
                } else {
                    player.rotation.y = cameraRotationY;
                }
            }
            if (keys.left) {
                player.position.add(rightDirection.clone().multiplyScalar(moveDistance));
                if (checkCollision()) {
                    player.position.add(rightDirection.clone().multiplyScalar(-moveDistance));
                }
            }
            if (keys.right) {
                player.position.add(rightDirection.clone().multiplyScalar(-moveDistance));
                if (checkCollision()) {
                    player.position.add(rightDirection.clone().multiplyScalar(moveDistance));
                }
            }
        }

        function updateCamera() {
            const cameraPosition = new THREE.Vector3(
                Math.sin(cameraRotationY) * cameraOffset.z,
                cameraOffset.y,
                Math.cos(cameraRotationY) * cameraOffset.z
            ).add(player.position);

            camera.position.copy(cameraPosition);
            camera.lookAt(player.position);
        }
        const playerBox = new THREE.Box3().setFromObject(player);

        function checkCollision() {
            playerBox.setFromObject(player);

            for (let i = 0; i < cubes.length; i++) {
                cubes[i].box.setFromObject(cubes[i].mesh);
                if (playerBox.intersectsBox(cubes[i].box)) {
                    return true;
                }
            }
            return false;
        }
        
        function animate() {
            requestAnimationFrame(animate);
            updatePlayerMovement();
            updateCamera();
            checkCollision();
            renderer.render(scene, camera);
            composer.render();
        }
        animate(); 
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
