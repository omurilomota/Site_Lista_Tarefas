export function gerarId() {
    return Date.now().toString();
}

export function dataHoje() {
    return new Date().toISOString().split('T')[0];
}