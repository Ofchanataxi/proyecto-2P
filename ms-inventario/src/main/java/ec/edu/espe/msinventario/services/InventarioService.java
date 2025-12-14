package ec.edu.espe.msinventario.services;

import ec.edu.espe.msinventario.models.entities.Inventario;

import java.util.Optional;

public interface InventarioService {
    Inventario asignarStock(Inventario inventario);
    Optional<Inventario> buscarPorId(Long id);
    Optional<Inventario> buscarPorSucursalYMedicamento(Long sucursalId, Long medicamentoId);
    void descontarStock(Long sucursalId, Long medicamentoId, Integer cantidad);
}
