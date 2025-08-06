function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  });
}

document.getElementById("uuid").value = generateUUID();

async function generateAddon() {
  const zip = new JSZip();
  const name = document.getElementById("addonName").value;
  const entity = document.getElementById("entityName").value;
  const identifier = document.getElementById("identifier").value;
  const langText = document.getElementById("langText").value;
  const textureURL = document.getElementById("textureURL").value;
  const uuid = document.getElementById("uuid").value;

  if (!name || !entity || !identifier || !langText || !textureURL) {
    alert("Preencha todos os campos.");
    return;
  }

  // Resource Pack
  const RP = zip.folder(name + "_RP");
  RP.file("manifest.json", JSON.stringify({
    "format_version": 2,
    "header": {
      "name": name + " RP",
      "uuid": generateUUID(),
      "version": [1, 0, 0],
      "min_engine_version": [1, 16, 0]
    },
    "modules": [{
      "type": "resources",
      "uuid": generateUUID(),
      "version": [1, 0, 0]
    }]
  }, null, 2));
  RP.file("texts/pt_BR.lang", `${identifier}=${langText}`);

  const textureData = await fetch(textureURL).then(res => res.blob());
  RP.folder("textures").folder("entity").file(`${entity}.png`, textureData);

  RP.file("textures/entity/${entity}.texture.json", JSON.stringify({
    "resource_pack_name": name + " RP",
    "texture_name": entity,
    "texture_data": {
      [entity]: {
        "textures": `textures/entity/${entity}`
      }
    }
  }, null, 2));

  // Behavior Pack
  const BP = zip.folder(name + "_BP");
  BP.file("manifest.json", JSON.stringify({
    "format_version": 2,
    "header": {
      "name": name + " BP",
      "uuid": generateUUID(),
      "version": [1, 0, 0],
      "min_engine_version": [1, 16, 0]
    },
    "modules": [{
      "type": "data",
      "uuid": generateUUID(),
      "version": [1, 0, 0]
    }]
  }, null, 2));

  const entityData = {
    "format_version": "1.10.0",
    "minecraft:entity": {
      "description": {
        "identifier": identifier,
        "is_spawnable": true,
        "is_summonable": true,
        "is_experimental": false
      },
      "components": {
        "minecraft:type_family": {
          "family": ["monster"]
        },
        "minecraft:nameable": {},
        "minecraft:health": { "value": 20, "max": 20 }
      }
    }
  };

  BP.folder("entities").file(`${entity}.json`, JSON.stringify(entityData, null, 2));

  // Export
  const content = await zip.generateAsync({ type: "blob" });
  const blob = new Blob([content], { type: "application/zip" });

  const link = document.getElementById("downloadLink");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.mcaddon`;
  link.style.display = "block";
  link.textContent = "📦 Baixar " + name + ".mcaddon";
}
